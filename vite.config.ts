import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // اجازه دسترسی از بیرون
    port: 5173, // یا همون پورتی که می‌خوای
    allowedHosts: ["4f006cdd0b4d.ngrok-free.app"],
  },
});
