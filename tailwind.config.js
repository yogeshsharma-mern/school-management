export default {
  darkMode: "class", // 👈 required
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        neutral: {
          light: "var(--color-neutral-light)",
          DEFAULT: "var(--color-neutral)",
          dark: "var(--color-neutral-dark)",
        },
        text: "var(--color-text)",
        button: "var(--button-color)",
      },
    },
  },
  plugins: [],
};
