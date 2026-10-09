/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        "background-2": token("background-2"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        foreground: token("foreground"),
        "foreground-2": token("foreground-2"),
        muted: token("muted"),
        cyan: token("cyan"),
        sky: token("blue"),
        pink: token("pink"),
        purple: token("purple"),
      },
      borderRadius: { card: "14px", control: "8px" },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
