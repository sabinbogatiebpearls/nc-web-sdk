"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentNameEnum = void 0;
exports.default = initialize;
const default_config_1 = require("./config/default-config");
const axios_1 = __importDefault(require("axios"));
// Define the Enum for component names
exports.ComponentNameEnum = {
    DOC_UTILITY: 'DOC_UTILITY',
    ON_BOARDING: 'ON_BOARDING'
};
function initialize({ getSessionId, config }) {
    // Merged configuration
    const cfg = Object.assign(Object.assign({}, default_config_1.DEFAULT_CONFIG), config);
    // State variables
    let currentSessionId = null;
    let currentIframe = null;
    let sessionCheckInterval = null;
    let tokenExpiryTime = '';
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
    const startSessionExpiryCheck = () => __awaiter(this, void 0, void 0, function* () {
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
    });
    const getAccessToken = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield getSessionId();
            console.log('session: ', session);
            if (!cfg.sessionValidation(session.accessToken)) {
                throw new Error("Invalid session token");
            }
            currentSessionId = session.accessToken;
            console.log('currentSessionId: ', currentSessionId);
            tokenExpiryTime = session.accessTokenExpiry;
            return currentSessionId;
        }
        catch (error) {
            console.error("Session validation failed:", error);
            throw error;
        }
    });
    const createIframeWithSource = (url) => {
        return new Promise((resolve, reject) => {
            const container = document.getElementById(default_config_1.DEFAULT_CONFIG.containerId);
            if (!container) {
                return reject(new Error(`Container with ID ${default_config_1.DEFAULT_CONFIG.containerId} not found`));
            }
            // Check if an iframe with the same ID already exists
            let iframe = document.getElementById(default_config_1.DEFAULT_CONFIG.iframeId);
            if (iframe) {
                console.log("nc-js: Iframe already exists, reusing it.");
                resolve(iframe);
                return;
            }
            // If iframe doesn't exist, create it
            iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.id = default_config_1.DEFAULT_CONFIG.iframeId;
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
    const connect = (componentName) => __awaiter(this, void 0, void 0, function* () {
        console.log('componentName: ', componentName);
        try {
            const accessToken = yield getAccessToken();
            console.log("Initializing WebSDK with session:", accessToken);
            //Check If Opaque Token is Valid
            if (!cfg.sessionValidation(accessToken)) {
                throw new Error("Opaque Token is not valid");
            }
            // Determine the URL based on componentName
            let iframeUrl;
            console.log('componentName: ', componentName);
            switch (componentName) {
                case exports.ComponentNameEnum.DOC_UTILITY:
                    iframeUrl = default_config_1.DEFAULT_CONFIG.baseUrls.docUtility;
                    break;
                case exports.ComponentNameEnum.ON_BOARDING:
                    iframeUrl = default_config_1.DEFAULT_CONFIG.baseUrls.onBoarding;
                    break;
                default:
                    throw new Error("Unknown component name");
            }
            // Create and load the iframe in the container
            const iframe = yield createIframeWithSource(iframeUrl);
            return iframe;
        }
        catch (error) {
            console.error("Error initializing WebSDK:", error);
        }
    });
    const logout = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`${default_config_1.DEFAULT_CONFIG.baseUrls.backendServer}/auth/access-token/revoke`, {
                accessToken: currentSessionId
            }, {
                headers: {
                    "Authorization": "b13d6405f3a3214d89d150137e39267d:7471c26b6104c923e6250cf7a827e120"
                }
            });
            console.log('response: ', response);
        }
        catch (_a) {
            throw new Error("Something went wrong while logout");
        }
    });
    return {
        connect,
        destroyIframe,
        initialize,
        logout
    };
}
