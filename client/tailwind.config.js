/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Deep teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6', // Blue
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // Soft green
          600: '#16a34a',
        },
        emergency: {
          500: '#ef4444', // Red
          600: '#dc2626',
        },
        neutral: {
          850: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
