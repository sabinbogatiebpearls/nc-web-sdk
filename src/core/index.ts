import { ComponentNameEnum } from "@common/enums";
import { DEFAULT_CONFIG } from "../config/default-config";
import { HTMLIFrameElement, INuveiInitConfig, INuveiInitParams, INuveiInstance } from "../interfaces";
import axios from "axios";
import { ISdkPostMessagePayload } from "@interfaces/post-message.interfaces";


export default async function loadAndInitialize(params: INuveiInitParams): Promise<INuveiInstance> {
  // destructure params
  const { publishableKey, fetchClientSession, config } = params;

  // Merged configuration
  const sdkConfig: INuveiInitConfig = { ...DEFAULT_CONFIG, ...config };


  // State variables
  let currentSessionId: string | null = null;
  let currentIframe: HTMLIFrameElement | null = null;
  let tokenExpiryTime: string = '';

  let sessionCheckInterval: ReturnType<typeof setInterval> | null = null;
  let expiryTimeout: ReturnType<typeof setTimeout> | null = null;

  let retryAttempts = 0;
  const MAX_RETRIES = 3;
  let iframeUrl: string;



  /**
   * Schedules a session expiry check in the future based on the provided
   * {@link tokenExpiryTime}. If the token has already expired, the check
   * is retried up to {@link MAX_RETRIES} times. If all retries fail, the
   * session check is stopped and the iframe is destroyed.
   *
   * @throws {Error} If the session check fails with an error, the iframe is
   * destroyed as a fallback.
   */
  const startSessionExpiryCheck = async () => {
    try {
      const expiryTime = new Date(tokenExpiryTime);
      // console.log('expiryTime: ', expiryTime);
      const now = new Date();

      const delay = expiryTime.getTime() - now.getTime();
      // console.log("Scheduling expiry check in", delay / (1000 * 60), "minutes");

      if (delay <= 0) {
        if (retryAttempts >= MAX_RETRIES) {
          // console.warn(`Max retry attempts (${MAX_RETRIES}) reached. Stopping session check.`);
          stopSessionExpiryCheck();
          destroyIframe();
          return;
        }

        retryAttempts++;
        // console.warn(`Token already expired. Attempt ${retryAttempts} of ${MAX_RETRIES}. Getting new session...`);
        return startSessionExpiryCheck(); // Retry
      }

      if (expiryTimeout) {
        clearTimeout(expiryTimeout);
      }

      expiryTimeout = setTimeout(async () => {
        // console.warn("Token expired. Getting new session...");

        if (retryAttempts >= MAX_RETRIES) {
          console.warn(`Max retry attempts (${MAX_RETRIES}) reached. Stopping session check.`);
          stopSessionExpiryCheck();
          destroyIframe();
          return;
        }

        await fetchClientSession(); // renew or destroy iframe if fails
        startSessionExpiryCheck(); // reschedule with the new expiry
      }, delay);
    } catch (err) {
      console.error("Failed to schedule session check:", err);
      destroyIframe(); // fallback: kill iframe on error
    }
  };


  /**
   * Stops the session expiry check scheduled by {@link startSessionExpiryCheck}.
   * This is useful when the iframe is destroyed or the session is manually
   * invalidated.
   */
  const stopSessionExpiryCheck = () => {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }
  };


  /**
   * Retrieves and validates the current client session.
   *
   * This asynchronous function fetches a new client session using
   * `fetchClientSession`, validates the session's access token using
   * `sessionValidation`, and updates the current session ID and
   * token expiry time. If the session token is invalid, an error is thrown.
   *
   * @returns {Promise<string>} The current session ID if validation is successful.
   * @throws {Error} If session validation fails or any error occurs during
   * the fetching or validation process.
   */
  const getClientSession = async (): Promise<string> => {
    try {
      const session = await fetchClientSession();

      if (!sdkConfig?.sessionValidation(session.accessToken)) {
        throw new Error("Invalid session token");
      }

      currentSessionId = session.accessToken;
      tokenExpiryTime = session.accessTokenExpiry;
      return currentSessionId;

    } catch (error) {
      console.error("Session validation failed:", error);
      throw error;
    }
  };


  /**
   * Creates an iframe with the given URL and appends it to the container with the given ID.
   * If an iframe with the same ID already exists, it is reused.
   *
   * @param {string} url The URL to load in the iframe
   * @returns {Promise<HTMLIFrameElement>} A promise that resolves to the created iframe element
   * @throws {Error} If the container element is not found or the iframe fails to load
   */
  const createIframeWithSource = (url: string): Promise<HTMLIFrameElement> => {
    return new Promise((resolve, reject) => {
      const container = document.getElementById(DEFAULT_CONFIG.containerId);
      if (!container) {
        return reject(new Error(`Container with ID ${DEFAULT_CONFIG.containerId} not found`));
      }

      // Check if an iframe with the same ID already exists
      let iframe = document.getElementById(DEFAULT_CONFIG.iframeId) as HTMLIFrameElement | null;
      if (iframe) {
        console.log("nc-js: Iframe already exists, reusing it.");
        resolve(iframe);
        return;
      }

      // If iframe doesn't exist, create it
      iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.id = DEFAULT_CONFIG.iframeId;

      // Apply styles
      Object.assign(iframe.style, sdkConfig.defaultIframeStyles);
      if (sdkConfig.customStyles) {
        Object.assign(iframe.style, sdkConfig.customStyles);
      }

      // Event handlers
      iframe.onload = () => {
        console.log("Iframe loaded successfully");
        // currentIframe = iframe;

        // Start session expiry check when iframe loads
        startSessionExpiryCheck();
        resolve(iframe);
      };

      iframe.onerror = () => {
        reject(new Error("Iframe failed to load"));
      };

      container.appendChild(iframe);
    });
  };


  /**
   * Destroys the current iframe if it exists, removing it from the DOM.
   * Also clears the session check interval associated with the iframe.
   */
  const destroyIframe = () => {
    if (currentIframe && currentIframe.parentNode) {
      currentIframe.parentNode.removeChild(currentIframe);
      currentIframe = null;
    }

    // Clear the session check interval when iframe is destroyed
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }
  };


  /**
   * Establishes a connection to a specified component by creating and loading an iframe.
   *
   * This asynchronous function initializes the WebSDK with a valid session, validates
   * the session token, determines the appropriate iframe URL based on the given
   * component name, and creates the iframe with the specified source URL.
   *
   * @param {string} componentName - The name of the component to connect to.
   *        Valid values are defined in the ComponentNameEnum.
   *
   * @returns {Promise<HTMLIFrameElement | void>} A promise that resolves to the created
   *          iframe element, or void if an error occurs.
   *
   * @throws {Error} Throws an error if the session token is invalid or if the
   *         specified component name is unknown.
   */
  const loadComponent = async (componentName: string): Promise<HTMLIFrameElement | void> => {
    console.log('componentName(Web SDK): ', componentName);

    let postMessageData: ISdkPostMessagePayload = {
      source: "NUVEI_FRONTEND_SDK",
      type: "SDK_COMMUNICATION",
      data: {
        frontendAccessToken: "",
        publishableKey,
        componentName: "ON_BOARDING",
        other: null
      }
    };

    try {
      const accessToken = await getClientSession();

      //Check If Opaque Token is Valid
      if (!sdkConfig.sessionValidation(accessToken)) {
        throw new Error("Opaque Token is not valid");
      }

      // if session token is valid
      postMessageData.data.frontendAccessToken = accessToken;

      // Determine the URL based on componentName
      switch (componentName) {
        case ComponentNameEnum.DOC_UTILITY:
          iframeUrl = `${DEFAULT_CONFIG.baseUrls.docUtility}?publishableKey=${publishableKey}`;
          break;

        case ComponentNameEnum.ON_BOARDING: {
          iframeUrl = `${DEFAULT_CONFIG.baseUrls.onBoarding}?publishableKey=${publishableKey}`;
          break;
        }

        default:
          throw new Error("Unknown component name");
      }

      // Create and load the iframe in the container
      const iframe = await createIframeWithSource(iframeUrl);
      currentIframe = iframe;
      sendMessageToMicroFrontend(postMessageData);
      return iframe;

    } catch (error) {
      console.error("Error initializing WebSDK:", error);
    }
  };


  /**
   * Logout of the WebSDK.
   *
   * Logs out the current session, revoking the access token. If the logout is
   * successful, the SDK will destroy the iframe.
   *
   * @throws {Error} Throws an error if something goes wrong during logout.
   */
  const logout = async () => {
    try {
      const response = await axios.post(`${DEFAULT_CONFIG.baseUrls.backendServer}/auth/access-token/revoke`,
        { accessToken: currentSessionId },
        { headers: { "Authorization": "b13d6405f3a3214d89d150137e39267d:7471c26b6104c923e6250cf7a827e120" } }
      );

      console.log('\nSDK logout response: ', response);
    } catch {
      throw new Error("Something went wrong while logout");
    }
  }


  const sendMessageToMicroFrontend = (payload: ISdkPostMessagePayload) => {
    if (!currentIframe || !currentIframe.contentWindow) {
      console.warn("Iframe is not initialized or not available");
      return;
    }

    console.log("Sending message to microfrontend:", payload);
    currentIframe.contentWindow.postMessage(payload, iframeUrl);
  };


  return {
    loadComponent,
    destroyIframe,
    loadAndInitialize,
    logout,
    sendMessageToMicroFrontend
  };
}