// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      title: 'PlantUML Studio',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-plantuml.png' }
      ]
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  future: {
    compatibilityVersion: 3,
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: false,
  },
  runtimeConfig: {
    plantumlServerUrl: process.env.PLANTUML_SERVER_URL || 'https://www.plantuml.com/plantuml',
    public: {
      defaultPlantumlServerUrl: 'https://www.plantuml.com/plantuml'
    }
  }
})
