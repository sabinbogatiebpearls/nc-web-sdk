// Configuration Constants
const DEFAULT_CONFIG = {
  iframeId: 'web-sdk-iframe',
  containerId: 'websdk-container',
  baseUrl: 'http://localhost:3000', // Default base URL
  defaultIframeStyles: {
    width: '100%',
    height: '100vh',
    border: 'none',
    display: 'block'
  },
  sessionValidation: (token) => token === "valid_token", // Default validation
  includeSessionInUrl: false,
  replaceExisting: true,
  logger: {
    log: console.log,
    error: console.error,
    warn: console.warn
  }
};

// Component Enum
export const ComponentNameEnum = {
  DOC_UTILITY: 'DOC_UTILITY',
  ON_BOARDING: 'ON_BOARDING'
};

// Custom Error Classes
class SDKError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SDKError';
    this.code = code;
  }
}

class SessionError extends SDKError {
  constructor(message) {
    super(message, 'INVALID_SESSION');
    this.name = 'SessionError';
  }
}

class ComponentError extends SDKError {
  constructor(message) {
    super(message, 'INVALID_COMPONENT');
    this.name = 'ComponentError';
  }
}

// Main SDK Class
export default function initializeSDK({ getSessionId, config = {} }) {
  // Merged configuration
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { logger } = cfg;

  // State variables
  let currentSessionId = null;
  let currentIframe = null;
  let eventListeners = {};

  // --------------------------
  // Internal Utility Functions
  // --------------------------

  const validateSession = async () => {
    try {
      const sessionId = await getSessionId();
      if (!cfg.sessionValidation(sessionId)) {
        throw new SessionError("Invalid session token");
      }
      currentSessionId = sessionId;
      return sessionId;
    } catch (error) {
      logger.error("Session validation failed:", error);
      throw error;
    }
  };

  const createIframe = (url) => {
    return new Promise((resolve, reject) => {
      const container = document.getElementById(cfg.containerId);
      if (!container) {
        return reject(new SDKError(`Container not found: ${cfg.containerId}`, 'CONTAINER_NOT_FOUND'));
      }

      // Remove existing iframe if configured to do so
      if (cfg.replaceExisting && currentIframe) {
        container.removeChild(currentIframe);
        currentIframe = null;
      }

      // Reuse iframe if it exists
      if (currentIframe) {
        logger.log("Reusing existing iframe");
        resolve(currentIframe);
        return;
      }

      // Create new iframe
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.id = cfg.iframeId;
      
      // Apply styles
      Object.assign(iframe.style, cfg.defaultIframeStyles);
      if (cfg.customStyles) {
        Object.assign(iframe.style, cfg.customStyles);
      }

      // Event handlers
      iframe.onload = () => {
        logger.log("Iframe loaded successfully");
        currentIframe = iframe;
        resolve(iframe);
      };

      iframe.onerror = () => {
        reject(new SDKError("Iframe failed to load", 'IFRAME_LOAD_ERROR'));
      };

      container.appendChild(iframe);
    });
  };

  const destroyIframe = () => {
    if (currentIframe && currentIframe.parentNode) {
      currentIframe.parentNode.removeChild(currentIframe);
      currentIframe = null;
    }
  };

  // ----------------------
  // Event System
  // ----------------------

  const on = (eventName, callback) => {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(callback);
  };

  const off = (eventName, callback) => {
    if (eventListeners[eventName]) {
      eventListeners[eventName] = eventListeners[eventName].filter(cb => cb !== callback);
    }
  };

  const emit = (eventName, data) => {
    if (eventListeners[eventName]) {
      eventListeners[eventName].forEach(cb => cb(data));
    }
  };

  // Initialize message listener for iframe communication
  window.addEventListener('message', (event) => {
    // Add origin validation here for production
    if (event.data && event.data.type) {
      emit(event.data.type, event.data.payload);
    }
  });

  // ----------------------
  // Component APIs
  // ----------------------

  const createComponentAPI = (componentName) => {
    const commonMethods = {
      close: () => {
        destroyIframe();
        emit(`${componentName}_CLOSED`, { component: componentName });
      },
      reload: () => {
        if (currentIframe) {
          currentIframe.contentWindow.location.reload();
          emit(`${componentName}_RELOADED`, { component: componentName });
        }
      }
    };

    switch (componentName) {
      case ComponentNameEnum.DOC_UTILITY:
        return {
          ...commonMethods,
          uploadDocument: (docData) => {
            // Implementation for document upload
            emit('DOCUMENT_UPLOAD_STARTED', docData);
          }
        };
      case ComponentNameEnum.ON_BOARDING:
        return {
          ...commonMethods,
          startOnboarding: (userData) => {
            // Implementation for onboarding
            emit('ONBOARDING_STARTED', userData);
          }
        };
      default:
        return commonMethods;
    }
  };

  // ----------------------
  // Public API
  // ----------------------

  const connect = async (componentName, options = {}) => {
    try {
      const sessionId = await validateSession();
      
      // Determine the URL
      let componentPath;
      switch (componentName) {
        case ComponentNameEnum.DOC_UTILITY:
          componentPath = '/doc-utility';
          break;
        case ComponentNameEnum.ON_BOARDING:
          componentPath = '/onboarding';
          break;
        default:
          throw new ComponentError(`Unknown component: ${componentName}`);
      }

      const baseUrl = options.domainName || cfg.baseUrl;
      const finalUrl = new URL(componentPath, baseUrl);

      if (cfg.includeSessionInUrl) {
        finalUrl.searchParams.append('sessionId', sessionId);
      }
      
      await createIframe(finalUrl.toString());
      return createComponentAPI(componentName);
      
    } catch (error) {
      logger.error("Connection failed:", error);
      throw error;
    }
  };

  const destroy = () => {
    destroyIframe();
    currentSessionId = null;
    eventListeners = {};
    logger.log("SDK cleaned up successfully");
  };

  // Initialize session validation
  validateSession().catch(err => {
    logger.error("Initial session validation failed:", err);
  });

  // Return public API
  return {
    connect,
    destroy,
    on,
    off,
    getCurrentSession: () => currentSessionId,
    ComponentNameEnum,
    version: '1.0.0'
  };
}