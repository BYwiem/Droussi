/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "sky-wash": "#ebf5ff",
        "paper-white": "#fafdff",
        "cloud-veil": "#f6f7f8",
        "midnight-ink": "#0a0d12",
        "pressed-charcoal": "#181d27",
        stone: "#535862",
        fog: "#93979f",
        cornflower: "#4fbeff",
        "morning-tint": "#cce7ff",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
