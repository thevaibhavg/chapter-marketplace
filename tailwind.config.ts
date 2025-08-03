import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        accent: "#06b6d4"
      },
      borderRadius: {
        xl: "1rem"
      },
      boxShadow: {
        glow: "0 0 25px rgba(3, 169, 244, 0.6)"
      }
    }
  },
  plugins: []
} satisfies Config;
