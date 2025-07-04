"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loadAndInitialize;
var enums_1 = require("../common/enums");
var default_config_1 = require("../config/default-config");
var axios_1 = __importDefault(require("axios"));
function loadAndInitialize(params) {
    return __awaiter(this, void 0, void 0, function () {
        var publishableKey, fetchClientSession, config, sdkConfig, currentSessionId, currentIframe, tokenExpiryTime, sessionCheckInterval, expiryTimeout, retryAttempts, MAX_RETRIES, iframeUrl, loadComponent, getClientSession, createIframeWithSource, startSessionExpiryCheck, destroyIframe, stopSessionExpiryCheck, sendMessageToMicroFrontend, logout;
        var _this = this;
        return __generator(this, function (_a) {
            publishableKey = params.publishableKey, fetchClientSession = params.fetchClientSession, config = params.config;
            sdkConfig = __assign(__assign({}, default_config_1.DEFAULT_CONFIG), config);
            currentSessionId = null;
            currentIframe = null;
            tokenExpiryTime = '';
            sessionCheckInterval = null;
            expiryTimeout = null;
            retryAttempts = 0;
            MAX_RETRIES = 3;
            loadComponent = function (componentName) { return __awaiter(_this, void 0, void 0, function () {
                var postMessageData, accessToken, iframe, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log('componentName(Web SDK): ', componentName);
                            postMessageData = {
                                source: "NUVEI_FRONTEND_SDK",
                                type: "SDK_COMMUNICATION",
                                data: {
                                    frontendAccessToken: "",
                                    publishableKey: publishableKey,
                                    componentName: "ON_BOARDING",
                                    other: null
                                }
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, getClientSession()];
                        case 2:
                            accessToken = _a.sent();
                            //Check If Opaque Token is Valid
                            if (!sdkConfig.sessionValidation(accessToken)) {
                                throw new Error("Opaque Token is not valid");
                            }
                            // if session token is valid
                            postMessageData.data.frontendAccessToken = accessToken;
                            // Determine the URL based on componentName
                            switch (componentName) {
                                case enums_1.ComponentNameEnum.DOC_UTILITY:
                                    iframeUrl = "".concat(default_config_1.DEFAULT_CONFIG.baseUrls.docUtility, "?publishableKey=").concat(publishableKey);
                                    break;
                                case enums_1.ComponentNameEnum.ON_BOARDING: {
                                    iframeUrl = "".concat(default_config_1.DEFAULT_CONFIG.baseUrls.onBoarding, "?publishableKey=").concat(publishableKey);
                                    break;
                                }
                                default:
                                    throw new Error("Unknown component name");
                            }
                            return [4 /*yield*/, createIframeWithSource(iframeUrl)];
                        case 3:
                            iframe = _a.sent();
                            currentIframe = iframe;
                            sendMessageToMicroFrontend(postMessageData);
                            return [2 /*return*/, iframe];
                        case 4:
                            error_1 = _a.sent();
                            console.error("Error initializing WebSDK:", error_1);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
            getClientSession = function () { return __awaiter(_this, void 0, void 0, function () {
                var session, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, fetchClientSession()];
                        case 1:
                            session = _a.sent();
                            if (!(sdkConfig === null || sdkConfig === void 0 ? void 0 : sdkConfig.sessionValidation(session.accessToken))) {
                                throw new Error("Invalid session token");
                            }
                            currentSessionId = session.accessToken;
                            tokenExpiryTime = session.accessTokenExpiry;
                            return [2 /*return*/, currentSessionId];
                        case 2:
                            error_2 = _a.sent();
                            console.error("Session validation failed:", error_2);
                            throw error_2;
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            createIframeWithSource = function (url) {
                return new Promise(function (resolve, reject) {
                    var container = document.getElementById(default_config_1.DEFAULT_CONFIG.containerId);
                    if (!container) {
                        return reject(new Error("Container with ID ".concat(default_config_1.DEFAULT_CONFIG.containerId, " not found")));
                    }
                    // Check if an iframe with the same ID already exists
                    var iframe = document.getElementById(default_config_1.DEFAULT_CONFIG.iframeId);
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
                    Object.assign(iframe.style, sdkConfig.defaultIframeStyles);
                    if (sdkConfig.customStyles) {
                        Object.assign(iframe.style, sdkConfig.customStyles);
                    }
                    // Event handlers
                    iframe.onload = function () {
                        console.log("Iframe loaded successfully");
                        // currentIframe = iframe;
                        // Start session expiry check when iframe loads
                        startSessionExpiryCheck();
                        resolve(iframe);
                    };
                    iframe.onerror = function () {
                        reject(new Error("Iframe failed to load"));
                    };
                    container.appendChild(iframe);
                });
            };
            startSessionExpiryCheck = function () { return __awaiter(_this, void 0, void 0, function () {
                var expiryTime, now, delay;
                var _this = this;
                return __generator(this, function (_a) {
                    try {
                        expiryTime = new Date(tokenExpiryTime);
                        now = new Date();
                        delay = expiryTime.getTime() - now.getTime();
                        // console.log("Scheduling expiry check in", delay / (1000 * 60), "minutes");
                        if (delay <= 0) {
                            if (retryAttempts >= MAX_RETRIES) {
                                // console.warn(`Max retry attempts (${MAX_RETRIES}) reached. Stopping session check.`);
                                stopSessionExpiryCheck();
                                destroyIframe();
                                return [2 /*return*/];
                            }
                            retryAttempts++;
                            // console.warn(`Token already expired. Attempt ${retryAttempts} of ${MAX_RETRIES}. Getting new session...`);
                            return [2 /*return*/, startSessionExpiryCheck()]; // Retry
                        }
                        if (expiryTimeout) {
                            clearTimeout(expiryTimeout);
                        }
                        expiryTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // console.warn("Token expired. Getting new session...");
                                        if (retryAttempts >= MAX_RETRIES) {
                                            console.warn("Max retry attempts (".concat(MAX_RETRIES, ") reached. Stopping session check."));
                                            stopSessionExpiryCheck();
                                            destroyIframe();
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, fetchClientSession()];
                                    case 1:
                                        _a.sent(); // renew or destroy iframe if fails
                                        startSessionExpiryCheck(); // reschedule with the new expiry
                                        return [2 /*return*/];
                                }
                            });
                        }); }, delay);
                    }
                    catch (err) {
                        console.error("Failed to schedule session check:", err);
                        destroyIframe(); // fallback: kill iframe on error
                    }
                    return [2 /*return*/];
                });
            }); };
            destroyIframe = function () {
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
            stopSessionExpiryCheck = function () {
                if (sessionCheckInterval) {
                    clearInterval(sessionCheckInterval);
                    sessionCheckInterval = null;
                }
            };
            sendMessageToMicroFrontend = function (payload) {
                if (!currentIframe || !currentIframe.contentWindow) {
                    console.warn("Iframe is not initialized or not available");
                    return;
                }
                console.log("Sending message to microfrontend:", payload);
                currentIframe.contentWindow.postMessage(payload, iframeUrl);
            };
            logout = function () { return __awaiter(_this, void 0, void 0, function () {
                var response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, axios_1.default.post("".concat(default_config_1.DEFAULT_CONFIG.baseUrls.backendServer, "/auth/access-token/revoke"), { accessToken: currentSessionId }, { headers: { "Authorization": "b13d6405f3a3214d89d150137e39267d:7471c26b6104c923e6250cf7a827e120" } })];
                        case 1:
                            response = _b.sent();
                            console.log('\nSDK logout response: ', response);
                            return [3 /*break*/, 3];
                        case 2:
                            _a = _b.sent();
                            throw new Error("Something went wrong while logout");
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            return [2 /*return*/, {
                    loadComponent: loadComponent,
                    destroyIframe: destroyIframe,
                    loadAndInitialize: loadAndInitialize,
                    logout: logout,
                    sendMessageToMicroFrontend: sendMessageToMicroFrontend
                }];
        });
    });
}
