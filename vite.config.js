import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const frontendPort = Number(process.env.FRONTEND_PORT || process.env.PORT || 5173);
const backendPort = Number(process.env.BACKEND_PORT || process.env.SERVER_PORT || 3000);

export default defineConfig({
  root: "client",
  plugins: [react()],
  define: {
    "import.meta.env.VITE_SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY || "")
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: frontendPort,
    allowedHosts: [".trycloudflare.com", "localhost", "127.0.0.1"],
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${backendPort}`,
        changeOrigin: false,
        secure: false
      }
    }
  }
});
