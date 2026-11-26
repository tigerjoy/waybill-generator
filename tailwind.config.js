/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        "on-brand": "var(--color-on-brand)",
        "brand-soft": "var(--color-brand-soft)",
        page: 'var(--color-page)',
        surface: 'var(--color-surface)',
        "surface-muted": 'var(--color-surface-muted)',
        "surface-sunken": 'var(--color-surface-sunken)',
        "surface-raised": 'var(--color-surface-raised)',
        ink: 'var(--color-ink)',
        "ink-muted": 'var(--color-ink-muted)',
        border: 'var(--color-border)',
        "border-strong": 'var(--color-border-strong)',
        positive: 'var(--color-positive)',
        "positive-soft": 'var(--color-positive-soft)',
        accent: 'var(--color-accent)',
        "accent-soft": 'var(--color-accent-soft)',
        negative: 'var(--color-negative)',
        "negative-soft": 'var(--color-negative-soft)'
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        number: ['var(--font-number)']
      }
    },
  },
  plugins: [],
}

