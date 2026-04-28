/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10233f",
        mist: "#eef4ff",
        sky: "#d7e7ff",
        primary: "#2563eb",
        "primary-dark": "#173b8f",
        "primary-soft": "#5b8cff",
      },
      fontFamily: {
        display: ["Open Sans", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 60px rgba(16, 35, 63, 0.12)",
      },
    },
  },
  plugins: [],
};
