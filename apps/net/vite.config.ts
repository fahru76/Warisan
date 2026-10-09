import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Single .env.local at the repo root serves both apps. Only VITE_* keys reach the browser.
  envDir: "../..",
  server: { port: 5174 },
  preview: { port: 4174 }
});
