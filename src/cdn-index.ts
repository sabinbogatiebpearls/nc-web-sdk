import initialize from "@core/index";

// Attach to window/globalThis
(globalThis as any).NCWebSDK = initialize;
