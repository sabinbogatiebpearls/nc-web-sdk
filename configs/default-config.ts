import { InitializeConfig } from "../interfaces";

// Configuration Constants
export const DEFAULT_CONFIG: InitializeConfig = {
  iframeId: 'web-sdk-iframe',
  containerId: 'websdk-container',
  baseUrls: {
    docUtility: 'http://localhost:3000',
    onBoarding: 'http://localhost:4000',
    backendServer: "https://jsonplaceholder.typicode.com"
  },
  defaultIframeStyles: {
    width: '100%',
    height: '100vh',
    border: 'none',
    display: 'block'
  },
  sessionValidation: (token) => token === "valid_token", // Default validation
  sessionCheckInterval: 5 * 60 * 1000, // 5 minutes
};
