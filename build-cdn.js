const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/cdn-index.ts"],
    bundle: true,
    outfile: "dist/cdn-index.js",
    format: "iife",  // Wraps everything in an Immediately Invoked Function Expression
    globalName: "NCWebSDK", // Sets window.NCWebSDK
    platform: "browser",
    target: ["es5"]
}).catch(() => process.exit(1));
