import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // اجازه دسترسی از بیرون
    port: 5173, // یا همون پورتی که می‌خوای
    allowedHosts: [
      "brics-trade-back-2.loca.lt/",
      "7081ba6f5369.ngrok-free.app",
      "erfuni.ir",
      "jemjoo.erfuni.ir",
    ],
  },
});
