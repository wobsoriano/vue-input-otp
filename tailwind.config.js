/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./dev/index.html",
    "./dev/src/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.2s ease-out infinite',
      },
    },
  },
  plugins: [],
}

