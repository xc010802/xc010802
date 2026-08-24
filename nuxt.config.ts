export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [],
  nitro: {
    preset: 'static',
    output: {
      dir: 'dist',  // 输出到 dist 目录
    },
  },
})