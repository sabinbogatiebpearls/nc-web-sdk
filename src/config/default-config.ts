import { InitializeConfig } from "../interfaces";

// Configuration Constants
export const DEFAULT_CONFIG: InitializeConfig = {
  iframeId: 'web-sdk-iframe',
  containerId: 'websdk-container',
  baseUrls: {
    docUtility: 'http://localhost:3000',
    onBoarding: 'http://localhost:4000',
    backendServer: "https://nonprodmanagement-us-e.azure-api.net/dev2/v1"
  },
  defaultIframeStyles: {
    width: '100%',
    height: '100vh',
    border: 'none',
    display: 'block'
  },
  sessionValidation: (token) => token === "67421e9ef775687157024d3eb056193d:675fa9789d58913f86f4530b769b234a", // Default validation
  sessionCheckInterval: 5 * 60 * 1000, // 5 minutes
};
