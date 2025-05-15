import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        //start from pink to purple
        spinnerGradientStart: 'rgb(186, 66, 255)',
        spinnerGradientEnd: 'rgb(0, 225, 255)',
        spinnerInner: 'rgb(36, 36, 36)',
        // Default Theme Colors
        default: {
          pink: '#FF69B4',
          purple: '#6A0D91',
          blue: '#1E90FF',
        },
        // Red Inferno Theme Colors
        inferno: {
          red: '#FF4500',
          orange: '#FFA500',
          yellow: '#FFD700',
        },
        // Green Forest Theme Colors
        forest: {
          green: '#228B22',
          brown: '#8B4513',
          black: '#000000',
        },
      },
        // Neon Theme Colo
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      width: {
        100: "30rem",
        200: "40rem",
        300: "50rem",
      },
      height: {
        100: "30rem",
        200: "40rem",
        300: "50rem",
      },
      borderRadius: {
        dxl: "45rem",
      },

      animation: {
        spinning: 'spin82341 1.7s linear infinite',
      },
      keyframes: {
        spin82341: {
          to: { transform: 'rotate(360deg)' },
        },
      },
    
      boxShadow: {
        'spinnerGlow': '0px -5px 20px 0px rgb(128, 0, 128), 0px 5px 20px 0px rgb(255, 105, 180)', // Updated glow colors
      },
    },
  },
  plugins: [],
};

export default config;
