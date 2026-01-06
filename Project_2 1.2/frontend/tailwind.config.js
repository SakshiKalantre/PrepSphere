/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PrepSphere brand colors
        maroon: {
          50: '#fdf8f7',
          100: '#f9eae8',
          200: '#f0d3cf',
          300: '#e2b7af',
          400: '#ce9487',
          500: '#b77162',
          600: '#a05950',
          700: '#854640',
          800: '#6c3935',
          900: '#5a302d',
          950: '#321917',
          DEFAULT: '#7A1F2A', // Main maroon color
        },
        gold: {
          50: '#fffdf9',
          100: '#fefbef',
          200: '#fcefd9',
          300: '#f8e1bb',
          400: '#f1cc92',
          500: '#e7b472',
          600: '#da9a5f',
          700: '#bd7a4d',
          800: '#9c6044',
          900: '#7f4d3a',
          950: '#4a291d',
          DEFAULT: '#D6B36A', // Main gold color
        },
        cream: {
          50: '#fffdfa',
          100: '#fffaf6',
          200: '#fff6ee',
          300: '#ffece1',
          400: '#ffd9c7',
          500: '#ffc0a5',
          600: '#f8a182',
          700: '#ec7f63',
          800: '#cb624b',
          900: '#a9503d',
          950: '#612920',
          DEFAULT: '#FFF8F2', // Main cream color
        },
        taupe: {
          DEFAULT: '#C4B5A0', // Taupe color for sign-in button
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}