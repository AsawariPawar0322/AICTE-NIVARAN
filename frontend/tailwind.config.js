/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        action: {
          DEFAULT: "var(--color-action)",
          hover: "var(--color-action-hover)",
          subtle: "rgba(194, 87, 12, 0.08)",
        },
        brand: {
          orange: "var(--color-brand-orange)",
          blue: "var(--color-brand-blue)",
          blueLight: "var(--color-brand-blue-100, #E6EEF9)",
        },
        navy: {
          DEFAULT: "var(--color-navy)",
          dark: "#061A3A",
          light: "#123978",
        },
        neutral: {
          text: "var(--color-text)",
          muted: "var(--color-text-muted)",
          border: "var(--color-border)",
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
        },
        focus: "var(--color-focus)",
        status: {
          success: {
            text: "var(--color-success-text)",
            bg: "var(--color-success-bg)",
            border: "var(--color-success-border)",
          },
          warning: {
            text: "var(--color-warning-text)",
            bg: "var(--color-warning-bg)",
            border: "var(--color-warning-border)",
          },
          danger: {
            text: "var(--color-danger-text)",
            bg: "var(--color-danger-bg)",
            border: "var(--color-danger-border)",
          },
          info: {
            text: "var(--color-info-text)",
            bg: "var(--color-info-bg)",
            border: "var(--color-info-border)",
          },
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', '"Segoe UI"', 'Arial', 'sans-serif'],
        mono: ['"Noto Sans Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '12': 'var(--space-12)',
        '16': '64px',
      },
    },
  },
  plugins: [],
}
