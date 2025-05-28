const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/cdn-index.ts"],
    bundle: true,
    outfile: "dist/cdn-index.js",
    format: "iife",
    globalName: "NCWebSDK",
    platform: "browser",
    target: "es2017", // ES5 fails due to axios – use a modern target
    define: {
        "process.env.NODE_ENV": '"production"',
        global: "window", // axios uses global in Node, fix for browser
    },
}).catch(() => process.exit(1));
