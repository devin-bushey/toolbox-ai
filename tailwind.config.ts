import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: 'hsl(var(--foreground))',
            '[class~="lead"]': {
              color: 'hsl(var(--foreground))',
            },
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary) / 0.8)',
              },
              textDecoration: 'none',
            },
            'strong, b': {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'h1, h2, h3, h4, h5, h6': {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'code, pre': {
              backgroundColor: 'hsl(var(--muted) / 0.5)',
              borderRadius: theme('borderRadius.md'),
              padding: theme('spacing.1'),
            },
            pre: {
              backgroundColor: 'hsl(var(--muted) / 0.5)',
              borderRadius: theme('borderRadius.md'),
              color: 'hsl(var(--foreground))',
              fontSize: '0.9em',
              padding: theme('spacing.4'),
              overflowX: 'auto',
            },
            blockquote: {
              borderLeftColor: 'hsl(var(--muted))',
              borderLeftWidth: '2px',
              paddingLeft: '1em',
              fontStyle: 'italic',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
            ol: {
              listStyleType: 'decimal',
            },
            ul: {
              listStyleType: 'disc',
            },
          },
        },
        sm: {
          css: {
            fontSize: '0.9rem',
            lineHeight: '1.5',
            'h1, h2, h3, h4': {
              marginTop: '1.25em',
              marginBottom: '0.75em',
            },
            p: {
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
          },
        },
        // Add dark mode support
        invert: {
          css: {
            color: 'hsl(var(--foreground))',
            'h1, h2, h3, h4, h5, h6': {
              color: 'hsl(var(--foreground))',
            },
            a: {
              color: 'hsl(var(--primary))',
            },
            'strong, b': {
              color: 'hsl(var(--foreground))',
            },
            code: {
              color: 'hsl(var(--foreground))',
            },
            pre: {
              backgroundColor: 'hsl(var(--muted) / 0.4)',
              color: 'hsl(var(--foreground))',
            },
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
