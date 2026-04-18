import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      fontSize: {
        base: ['17px', { lineHeight: '1.7' }],
      },
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          50: '#E8EEF5',
          100: '#C5D5E8',
          200: '#9DB8D6',
          300: '#759BC4',
          400: '#4D7EB2',
          500: '#1E3A5F',
          600: '#1A3354',
          700: '#152B46',
          800: '#102239',
          900: '#0B1A2B',
        },
        accent: {
          DEFAULT: '#E85D04',
          50: '#FEF0E7',
          100: '#FDD5B8',
          200: '#FBBA89',
          300: '#F99F5A',
          400: '#F7842B',
          500: '#E85D04',
          600: '#C95103',
          700: '#AA4503',
          800: '#8B3902',
          900: '#6C2D01',
        },
        danger: '#C1272D',
        success: '#2D6A4F',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      minHeight: {
        '14': '3.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
