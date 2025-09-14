import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // اجازه دسترسی از بیرون
    port: 5173, // یا همون پورتی که می‌خوای
    allowedHosts: [
      "a0b5f8f0d0ca.ngrok-free.app",
      "erfuni.ir",
      "jemjoo.erfuni.ir",
    ],
  },
});
