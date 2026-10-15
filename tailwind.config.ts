import type { Config } from 'tailwindcss';
// Design tokens live in globals.css (:root) and are mapped here.
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)', deep: 'var(--deep)', secondary: 'var(--secondary)', bright: 'var(--bright)',
        mint: 'var(--mint)', softmint: 'var(--softmint)', pale: 'var(--pale)', ivory: 'var(--ivory)',
        ink: 'var(--ink)', muted: 'var(--muted)', line: 'var(--line)',
        coral: 'var(--coral)', coralbg: 'var(--coralbg)', success: 'var(--success)',
      },
      boxShadow: { soft: 'var(--shadow)' },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
} satisfies Config;
