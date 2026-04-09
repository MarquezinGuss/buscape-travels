/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        navy: {
          950: "#060C1A",
          900: "#0C1628",
          800: "#111E35",
          700: "#1A2D4F",
          600: "#1E3A6E",
        },
        coral: {
          400: "#FF8C6B",
          500: "#F97316",
          600: "#EA6C00",
        },
        sand: {
          50:  "#FFF8F0",
          100: "#FEF3E2",
          200: "#FDE8C4",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
