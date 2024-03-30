import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/sw.js": {
        target: "http://localhost:5000/",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:5000/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/static": {
        target: "http://localhost:5000/static",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/static/, ""),
      },
    },
  },
});
