import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171714",
        paper: "#f7f5ef",
        canvas: "#eeece5",
        saffron: "#e9b949",
        sky: "#b8ddeb",
        rust: "#a3422d",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Arial", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
      },
      boxShadow: {
        lift: "0 18px 45px rgba(31, 30, 25, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
