import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Thêm đoạn này để sửa lỗi COOP
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      "/api": {
        // target: "https://tramcuuho.onrender.com",
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
