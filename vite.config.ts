import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [react()],
    esbuild:
        command === "build"
            ? { pure: ["console.log", "console.info", "console.debug"] }
            : undefined,
    server: {
        watch: {
            usePolling: true,
        },
    },
}));
