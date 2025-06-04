
export interface INuveiInitParams {
  publishableKey: string;
  fetchClientSession: () => Promise<IClientSession>;
  config?: Partial<INuveiInitConfig>;
}

export interface IClientSession {
  accessToken: string;
  accessTokenExpiry: string;
  region: string
}

export interface INuveiInitConfig {
  iframeId: string;
  containerId: string;
  baseUrls: Record<string, string>;
  defaultIframeStyles: Record<string, string>;
  customStyles?: Record<string, string>;
  sessionValidation: (token: string) => boolean;
  sessionCheckInterval: number;
}

export interface HTMLIFrameElement extends HTMLElement {
  // Properties
  allow: string;
  allowFullscreen: boolean;
  contentDocument: Document | null;
  contentWindow: Window | null;
  height: string;
  name: string;
  referrerPolicy: string;
  sandbox: DOMTokenList;
  src: string;
  srcdoc: string;
  width: string;
  // Methods
  getSVGDocument(): Document | null;
}

export interface sendMessagePayload {
  type: string;
  message: string;
}

export interface INuveiInstance {
  loadComponent: (componentName: string) => Promise<HTMLIFrameElement | void>;
  destroyIframe: () => void;
  logout: () => void;
  loadAndInitialize: (params: INuveiInitParams) => Promise<INuveiInstance>;
  sendMessageToMicroFrontend: (message: sendMessagePayload) => void;
}