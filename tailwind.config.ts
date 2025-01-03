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
        primary: "#fff", // Main background
        secondary: "#004c6d", // Navbar Footer
        accent: "#fefae0", // Button background
        light: "#2d769b", // Lighter background for elements
        muted: "#8dbedb", // Muted tones for hover
      },
    },
  },
  plugins: [],
} satisfies Config;
