
export interface InitializeParams {
  publishableKey: string;
  getSessionId: () => Promise<SessionResponse>;
  config?: Partial<InitializeConfig>;
}

export interface SessionResponse {
  accessToken: string;
  accessTokenExpiry: string;
  region: string
}

export interface InitializeConfig {
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

export interface WebSDK {
  connect: (componentName: string) => Promise<HTMLIFrameElement | void>;
  destroyIframe: () => void;
  logout: () => void;
  initialize: (params: InitializeParams) => WebSDK;
}