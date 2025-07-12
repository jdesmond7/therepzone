// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-12-12',
  
  // Disable DevTools in development for better performance
  devtools: { enabled: false },
  
  // Optimize development build
  nitro: {
    esbuild: {
      options: {
        target: 'es2020'
      }
    }
  },
  
  // Optimize Vite for development
  vite: {
    build: {
      target: 'es2020'
    },
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
    }
  },
  
  // Only essential modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/ui'
  ],
  
  // Optimize TailwindCSS
  tailwindcss: {
    cssPath: '~/assets/css/global.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    viewer: false, // Disable Tailwind viewer for faster builds
    quiet: true    // Reduce console output
  },
  
  css: ['~/assets/css/global.css'],
  
  // Disable unnecessary features for development
  experimental: {
    payloadExtraction: false,
    viewTransition: false
  }
})