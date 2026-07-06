import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#3b82f6',
          light: '#eff6ff',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
