export default defineNuxtConfig({
  compatibilityDate: '2026-08-24',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  
  // 修正路径：指向 app/assets/css/main.css
  css: ['@/app/assets/css/main.css'],
  // 或者
  // css: ['~/app/assets/css/main.css'],
  
  nitro: {
    preset: 'vercel',
  },
})