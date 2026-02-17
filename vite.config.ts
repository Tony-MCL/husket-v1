// ===============================
// vite.config.ts
// GitHub Pages base-path via VITE_BASE
// ===============================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const base = process.env.VITE_BASE ?? "/";

  return {
    plugins: [react()],
    base,
    build: {
      outDir: "dist"
    }
  };
});
