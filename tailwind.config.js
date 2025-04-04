/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        'text-primary': 'var(--text-color)',
        'text-secondary': 'var(--text-secondary)',
        'border': 'var(--border-color)',
      },
      backgroundColor: {
        'bg': 'var(--bg-color)',
        'bg-alt': 'var(--bg-alt)',
        'card': 'var(--card-bg)',
        'card-hover': 'var(--card-hover-bg)',
        'feature-icon': 'var(--feature-icon-bg)',
      },
      gradientColorStops: {
        'hero-start': 'var(--hero-gradient-start, #2563eb)',
        'hero-end': 'var(--hero-gradient-end, #4f46e5)',
        'cta-start': 'var(--cta-gradient-start, #3b82f6)',
        'cta-end': 'var(--cta-gradient-end, #6366f1)',
      },
      boxShadow: {
        'custom': '0 4px 6px var(--shadow-color)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}

