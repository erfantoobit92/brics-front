import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // اجازه دسترسی از بیرون
    port: 5173, // یا همون پورتی که می‌خوای
    allowedHosts: [
      "ecf23a8256ea.ngrok-free.app",
      "brics-trade-back-2.loca.lt/",
      "brics-trade-front.loca.lt",
      "6f127b235d48.ngrok-free.app",
      "erfuni.ir",
      "jemjoo.erfuni.ir",
    ],
  },
});
