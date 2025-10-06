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
          DEFAULT: "hsl(142, 76%, 36%)",
          foreground: "hsl(355, 7%, 97%)",
        },
        primary: {
          DEFAULT: "hsl(142, 76%, 36%)",
          foreground: "hsl(355, 7%, 97%)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
