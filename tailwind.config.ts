import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          10: "var(--primary-10)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          500: "var(--primary-500)",
        },
        grey: {
          400: "var(--grey-400)",
        },
      },
      fontSize: {
        "heading-xxl": ["4.75rem", "4.75rem"], // 76px, 100%
        "heading-xl": ["4.125rem", "4.125rem"], // 66px, 100%
        "heading-lg": ["3.5rem", "3.5rem"], // 56px, 100%
        "heading-md": ["3rem", "3rem"], // 48px, 100%
        "heading-sm": ["2.375rem", "40px"], // 38px, 105%
        "heading-xs": ["1.75rem", "30px"], // 28px, 107%
        "heading-xxs": ["1.5rem", "26px"], // 24px, 108%
        "heading-xxxs": ["1.125rem", "20px"], // 18px, 111%
      },
      fontFamily: {
        zilla: ["Zilla Slab", "serif"],
        mono: ["Fira Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
