/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        panel: "#141414",
        panelborder: "#262620",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F5D577",
          dim: "#8A7328",
        },
        paper: "#F4F1EA",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #F5D577 50%, #D4AF37 100%)",
      },
    },
  },
  plugins: [],
};
