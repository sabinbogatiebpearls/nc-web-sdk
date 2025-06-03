import loadAndInitialize from "@core/index";

// Attach to window/globalThis
(window as any).NCWebSDK = loadAndInitialize;
