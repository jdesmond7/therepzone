// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-12-12',
  
  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    // public keys that are exposed to the client-side
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY
    }
  },
  
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
  },
  
  // Auto-import components
  components: {
    dirs: [
      '~/components',
      '~/components/shared',
      '~/components/coach',
      '~/components/athlete'
    ]
  }
})