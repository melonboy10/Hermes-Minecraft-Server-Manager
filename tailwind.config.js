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
        tertiary: '#aa9d8e',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          150: '#eceef1',
          200: '#e5e7eb',
          250: '#dbdee3',
          300: '#d1d5db',
          350: '#b7bcc5',
          400: '#9ca3af',
          450: '#848b98',
          500: '#6b7280',
          550: '#5b6472',
          600: '#4b5563',
          650: '#414b5a',
          700: '#374151',
          750: '#2b3544',
          800: '#1f2937',
          850: '#18212f',
          900: '#111827',
          950: '#030712'
        }
      }
    }
  },
  plugins: ['prettier-plugin-tailwindcss']
};
