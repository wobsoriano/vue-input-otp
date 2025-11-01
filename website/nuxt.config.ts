import tailwind from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['shadcn-nuxt'],
  css: [
    '~/assets/css/tailwind.css',
    'vue-sonner/style.css',
  ],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
  vite: {
    plugins: [
      tailwind(),
    ],
  },
  runtimeConfig: {
    public: {
      gitHubUrl: 'https://github.com/wobsoriano',
      repoUrl: 'https://github.com/wobsoriano/vue-input-otp',
      twitterUrl: 'https://twitter.com/wobsoriano',
    },
  },

  compatibilityDate: '2024-08-25',
})
