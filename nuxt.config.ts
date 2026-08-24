import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [],
  css: ['assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    preset: 'vercel',
  },
})