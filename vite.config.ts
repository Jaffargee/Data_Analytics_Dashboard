import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
    server: {
    port: 3000,        // Specify your desired port
    strictPort: true,  // Exit if port is already in use
    host: true,        // Expose to the network (required for Docker/external access)
  }
});
