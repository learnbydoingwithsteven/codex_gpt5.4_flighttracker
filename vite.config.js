import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1300,
    },
    server: {
        proxy: {
            "/api/opensky": {
                target: "https://opensky-network.org/api",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/opensky/, ""),
            },
        },
    },
});
