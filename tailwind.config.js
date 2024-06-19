/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        minecraftia: ['Minecraftia', 'sans-serif'],
        atkinson: ['Atkinson Hyperlegible', 'sans-serif'],
        handwriting: ['Virgil', 'cursive']
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite'
      },
      colors: {
        primary: '#ffd392',
        secondary: '#e6bc8a',
        tertiary: '#aa9d8e'
      }
    }
  },
  plugins: ['prettier-plugin-tailwindcss']
};
