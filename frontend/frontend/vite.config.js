import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/signup": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/tasks": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/createTask": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/files": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
