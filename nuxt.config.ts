import tailwindcss from '@tailwindcss/vite'
import koLocale from './app/theme/locale/ko.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-02-20',
  modules: [
    '@primevue/nuxt-module',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    // 'nuxt-security',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  imports: {
    dirs: ['~/composables/**'],
  },

  devtools: { enabled: true },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.cdnfonts.com/css/plus-jakarta-sans' },
      ],
      script: [
        { src: 'https://kit.fontawesome.com/46ad5ba21c.js', crossorigin: 'anonymous' },
      ],
    },
  },
  runtimeConfig: {
    rpaApiUrl: '',
    rpaAuthApiUrl: '',
    public: {
      appName: 'WRPA-Webb',
    }
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  },
  css: ['@/assets/styles.scss', '@/assets/tailwind.css'],
  future: {
    // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
    compatibilityVersion: 4,
  },

  experimental: {
    // https://nuxt.com/blog/v3-5#fully-typed-pages
    typedPages: true,
  },
  typescript: {
    builder: 'vite',
    tsConfig: {
      compilerOptions: {
        strictNullChecks: true, // Enable strict null checks
      },
    },
  },
  primevue: {
    usePrimeVue: true,
    components: {
      include: '*',
      exclude: ['Form', 'FormField'],
    },
    directives: {
      include: '*',
    },
    importTheme: { from: '@/theme/app-theme.ts' },
    options: {
      ripple: true,
      pt: {
        column: {
          columnHeaderContent: {
            class: ['justify-center']
          }
        }
      },
      // Choose your language here: https://github.com/primefaces/primelocale
      locale: { ...koLocale },
    },
  },
  // security: {
  //   enabled: process.env.NODE_ENV === 'production',
  //   headers: {
  //     contentSecurityPolicy: false,
  //   },
  // },
})
