// src/tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  // این بخش مهمترین قسمت است
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // <--- این خط را جایگزین کنید
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6f9a37', // سبز اصلی
          light: '#e9f5db',
        },
        secondary: '#0a2540', // سرمه‌ای تیره
        gray: {
          dark: '#343A40',
          medium: '#6C757D',
          light: '#F8F9FA',
        },
      },
      backgroundImage: {
        'category-shape': "url('/shapes/category-bg-shape.svg')",
        'discount-shape': "url('/shapes/discount-bg-shape.svg')",
        'footer-shape': "url('/shapes/footer-bg-shape.svg')",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      }
    },
  },
  plugins: [],
};
export default config;