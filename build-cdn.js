const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/cdn-index.ts"],
    bundle: true,
    outfile: "dist/cdn-index.js",
    format: "iife",
    platform: "browser",
    target: "es2017",
    minify: true, // Add minification for production
    define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
    },
}).catch(() => process.exit(1));
