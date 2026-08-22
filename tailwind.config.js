/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          white: '#FFFFFF',
          'off-white': '#F8F8F8',
          'light-grey': '#F1F1F1',
          grey: '#D9D9D9',
          'mid-grey': '#BFBFBF',
          'dark-grey': '#333333',
          charcoal: '#1F1F1F',
          black: '#111111',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(17,17,17,0.04), 0 1px 3px 0 rgba(17,17,17,0.03)',
        card: '0 1px 3px 0 rgba(17,17,17,0.04), 0 4px 12px -2px rgba(17,17,17,0.05)',
        lift: '0 4px 16px -2px rgba(17,17,17,0.10), 0 2px 6px -2px rgba(17,17,17,0.06)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'scan': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(168px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.4,0,0.2,1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1)',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.4,0,0.2,1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.4,0,0.2,1)',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.4,0,0.2,1)',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'scan': 'scan 2.2s ease-in-out infinite alternate',
        'spin-slow': 'spin-slow 1.1s linear infinite',
      },
    },
  },
  plugins: [],
};
