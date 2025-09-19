module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Optimize font loading
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    // Disable unused features to reduce CSS size
    float: false,
    clear: false,
    skew: false,
    caretColor: false,
    sepia: false,
  },
  // Purge unused CSS more aggressively
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: [
        // Keep critical classes
        'line-clamp-1',
        'line-clamp-3',
        'animate-spin',
      ],
    },
  },
}