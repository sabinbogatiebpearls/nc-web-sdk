import { InitializeParams, WebSDK } from "../interfaces/index";
/**
 * Initializes the WebSDK by taking in a getSessionId function and optional configuration.
 * The getSessionId function is expected to return a promise that resolves to a SessionResponse
 * object containing an accessToken and accessTokenExpiry.
 * The configuration object can contain the following properties:
 * - containerId: The id of the container element where the iframe will be appended. Defaults to "websdk-container".
 * - iframeId: The id of the iframe element. Defaults to "web-sdk-iframe".
 * - baseUrls: An object containing the base URLs for the different components. Defaults to the default base URLs.
 * - defaultIframeStyles: An object containing the default styles for the iframe. Defaults to an empty object.
 * - customStyles: An optional object containing custom styles for the iframe. Defaults to null.
 * - sessionValidation: A function that takes in an accessToken and returns true if it is valid, false otherwise. Defaults to a function that always returns true.
 * - sessionCheckInterval: The interval in milliseconds to check for session expiry. Defaults to 5 minutes.
 * @param {InitializeParams} params The parameters object.
 * @returns {WebSDK} The initialized WebSDK object.
 */
export default function initialize({ getSessionId, config }: InitializeParams): WebSDK;
//# sourceMappingURL=index.d.ts.map