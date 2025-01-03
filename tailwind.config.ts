import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ADC178", // Main background
        secondary: "#6C584C", // Text and icons
        accent: "#A98467", // Button background
        light: "#F0EAD2", // Lighter background for elements
        muted: "#DDE5B6", // Muted tones for hover
      },
    },
  },
  plugins: [],
} satisfies Config;
