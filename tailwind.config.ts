import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "hsl(340, 82%, 68%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        primary: {
          DEFAULT: "hsl(310, 70%, 65%)",
          foreground: "hsl(0, 0%, 100%)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
