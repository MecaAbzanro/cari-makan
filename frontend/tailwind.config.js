/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen: {
          DEFAULT: '#FBF6EF',
          soft: '#F4ECE0',
          deep: '#ECE0CF',
        },
        char: {
          DEFAULT: '#2B2118',
          soft: '#6E5E50',
          faint: '#9C8C7C',
        },
        clay: '#E5D9C8',
        paprika: {
          50: '#FBE9E2',
          100: '#F5C9B7',
          200: '#EEAD8C',
          300: '#E58D62',
          400: '#D9703F',
          500: '#C2542F',
          600: '#A4421F',
          700: '#83331A',
          800: '#5F2513',
        },
        saffron: {
          50: '#FBF1DD',
          100: '#F3DBA3',
          200: '#ECC87C',
          300: '#E5B965',
          400: '#E0AC54',
          500: '#D89B3C',
          600: '#B87F26',
          700: '#92631D',
        },
        basil: {
          50: '#EAF0E8',
          100: '#C9D9C4',
          200: '#A9C2A1',
          300: '#96B38C',
          400: '#83A37D',
          500: '#6F8F6B',
          600: '#54724F',
          700: '#3F583B',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 6px 20px -8px rgba(43, 33, 24, 0.15)',
        lift: '0 14px 30px -10px rgba(43, 33, 24, 0.25)',
        glow: '0 0 0 1px rgba(194, 84, 47, 0.08), 0 20px 40px -16px rgba(194, 84, 47, 0.35)',
        card: '0 2px 8px -2px rgba(43, 33, 24, 0.08), 0 12px 24px -12px rgba(43, 33, 24, 0.12)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.92)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '40%': { transform: 'scale(0.95)' },
          '60%': { transform: 'scale(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(28px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
        fadeUp: 'fadeUp 0.5s ease-out both',
        popIn: 'popIn 0.25s ease-out both',
        heartBeat: 'heartBeat 0.65s ease-in-out',
        float: 'float 4.5s ease-in-out infinite',
        slideUp: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        scaleIn: 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
}

