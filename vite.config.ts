// ===============================
// vite.config.ts
// GitHub Pages: safest option is relative base ("./").
// Avoids whitescreen/404 from wrong asset paths.
// ===============================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist"
  }
});
