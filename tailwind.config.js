const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        sdw: {
          pine: '#4C1D6B',        /* TicketPlan Signature Deep Royal Plum / Violet */
          pineLight: '#632585',   /* TicketPlan Vibrant Rich Purple */
          emerald: '#7E2A8C',     /* TicketPlan Accent Magenta/Purple */
          gold: '#E5A93C',        /* TicketPlan Warm Sunset Gold ("WITH US") */
          goldLight: '#FDF4E3',   /* Soft Warm Gold Background */
          sand: '#FAF7FC',        /* TicketPlan Ultra-Soft Lavender-White Background */
          surface: '#FFFFFF',     /* Pure White Card Surface */
          charcoal: '#240E31',    /* TicketPlan Deep Plum-Black Body Text */
          muted: '#786584',       /* TicketPlan Subtle Label Violet-Slate */
          border: '#E8DFEE',      /* Delicate Border Tone */
          badgeBg: '#F3EAF7'      /* Soft Purple Tint Badge */
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        arabic: ['Amiri', 'serif']
      },
      boxShadow: {
        'soft': '0 2px 14px -2px rgba(76, 29, 107, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -3px rgba(76, 29, 107, 0.12)'
      }
    }
  },
  plugins: []
};
