// 只装模块：组件自动注册、令牌与皮肤、SSR 首帧主题都由 @xihan-ui/vue/nuxt 接好
export default defineNuxtConfig({
  modules: ['@xihan-ui/vue/nuxt'],
  xihanUI: {
    visualEnvironment: {
      // 读者切过的明暗存在这个键下，下次打开时首帧就是那一套，不会先闪一下浅色
      storageKey: 'xihan-ui-example-nuxt',
      // initial 压过存的值：这里只定密度，明暗留给读者自己切
      initial: { density: 'compact' },
    },
  },
  compatibilityDate: '2026-10-01',
})
