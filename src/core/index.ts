import { ComponentNameEnum } from "@common/enums";
import { DEFAULT_CONFIG } from "@config/default-config";
import { HTMLIFrameElement, InitializeConfig, InitializeParams, WebSDK } from "@interfaces/index";
import axios from "axios";


export default function initialize({ getSessionId, config }: InitializeParams): WebSDK {
    // Merged configuration
    const cfg: InitializeConfig = { ...DEFAULT_CONFIG, ...config };

    // State variables
    let currentSessionId: string | null = null;
    let currentIframe: HTMLIFrameElement | null = null;
    let sessionCheckInterval: number | null = null;
    let tokenExpiryTime: string = '';

    // const startSessionExpiryCheck = () => {
    //   // Clear existing interval if any
    //   if (sessionCheckInterval) {
    //     clearInterval(sessionCheckInterval);
    //   }

    //   // Set up new interval
    //   sessionCheckInterval = setInterval(async () => {
    //     try {
    //       const session = await getSessionId();
    //       console.log('session: ', session);
    //       if (!cfg.sessionValidation(session.accessToken)) {
    //         console.warn("Session has expired, destroying iframe");
    //         destroyIframe();
    //         if (sessionCheckInterval) {
    //           clearInterval(sessionCheckInterval);
    //           sessionCheckInterval = null;
    //         }
    //       }
    //     } catch (error) {
    //       console.error("Error during session expiry check:", error);
    //       destroyIframe();
    //       if (sessionCheckInterval) {
    //         clearInterval(sessionCheckInterval);
    //         sessionCheckInterval = null;
    //       }
    //     }
    //   }, cfg.sessionCheckInterval); // 5 minutes in milliseconds
    // };

    const startSessionExpiryCheck = async () => {
        const expiryTime = new Date(tokenExpiryTime);
        console.log('expiryTime: ', expiryTime);

        const interval = setInterval(() => {
            const now = new Date();
            console.log('now: ', now);
            console.log('now >= expiryTime: ', now >= expiryTime);
            if (now >= expiryTime) {
                // clearInterval(interval); // Stop checking
                getSessionId();
            }
        }, 10000);
    }

    const getAccessToken = async () => {
        try {
            const session = await getSessionId();
            console.log('session: ', session);
            if (!cfg.sessionValidation(session.accessToken)) {
                throw new Error("Invalid session token");
            }
            currentSessionId = session.accessToken;
            console.log('currentSessionId: ', currentSessionId);
            tokenExpiryTime = session.accessTokenExpiry;
            return currentSessionId;
        } catch (error) {
            console.error("Session validation failed:", error);
            throw error;
        }
    };

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
            Object.assign(iframe.style, cfg.defaultIframeStyles);
            if (cfg.customStyles) {
                Object.assign(iframe.style, cfg.customStyles);
            }

            // Event handlers
            iframe.onload = () => {
                console.log("Iframe loaded successfully");
                currentIframe = iframe;

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

    // connect now accepts componentName to determine iframe source
    const connect = async (componentName: string): Promise<HTMLIFrameElement | void> => {
        console.log('componentName: ', componentName);
        try {
            const accessToken = await getAccessToken();
            console.log("Initializing WebSDK with session:", accessToken);

            //Check If Opaque Token is Valid
            if (!cfg.sessionValidation(accessToken)) {
                throw new Error("Opaque Token is not valid");
            }

            // Determine the URL based on componentName
            let iframeUrl;
            console.log('componentName: ', componentName);
            switch (componentName) {
                case ComponentNameEnum.DOC_UTILITY:
                    iframeUrl = DEFAULT_CONFIG.baseUrls.docUtility;
                    break;
                case ComponentNameEnum.ON_BOARDING:
                    iframeUrl = DEFAULT_CONFIG.baseUrls.onBoarding;
                    break;
                default:
                    throw new Error("Unknown component name");
            }


            // Create and load the iframe in the container
            const iframe = await createIframeWithSource(iframeUrl);
            return iframe;
        } catch (error) {
            console.error("Error initializing WebSDK:", error);
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post(`${DEFAULT_CONFIG.baseUrls.backendServer}/auth/access-token/revoke`, {
                accessToken: currentSessionId
            }, {
                headers: {
                    "Authorization": "b13d6405f3a3214d89d150137e39267d:7471c26b6104c923e6250cf7a827e120"
                }
            });
            console.log('response: ', response);
        } catch {
            throw new Error("Something went wrong while logout");
        }
    }

    return {
        connect,
        destroyIframe,
        initialize,
        logout
    };
}
