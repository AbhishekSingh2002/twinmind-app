import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/transcribe": "http://localhost:5000",
      "/api/suggestions": "http://localhost:5000",
      "/api/chat": "http://localhost:5000",
      "/api/health": "http://localhost:5000",
    },
  },
});