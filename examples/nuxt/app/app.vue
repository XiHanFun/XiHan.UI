<script setup lang="ts">
// 组件不必 import：模块按用到的组件从 @xihan-ui/vue 主入口导入
const { $xhVisual } = useNuxtApp()
const dark = ref(false)
const notify = ref(true)

// 明暗按读者的偏好定，服务端不知道：挂载后再读，免得水合对不上
let stop: (() => void) | undefined
onMounted(() => {
  dark.value = $xhVisual.getState().mode === 'dark'
  stop = $xhVisual.subscribe((state) => {
    dark.value = state.mode === 'dark'
  })
})
onBeforeUnmount(() => stop?.())

function toggleMode() {
  $xhVisual.setPreference({ mode: dark.value ? 'light' : 'dark' })
}
</script>

<template>
  <main class="page">
    <h1>XiHan.UI × Nuxt</h1>
    <XhButton variant="solid" @click="toggleMode">
      切到{{ dark ? '浅色' : '深色' }}
    </XhButton>
    <label class="row">
      <XhSwitch v-model:checked="notify" aria-label="通知" />
      通知：{{ notify ? '开' : '关' }}
    </label>
  </main>
</template>

<style>
.page {
  display: grid;
  gap: 16px;
  align-content: start;
  justify-items: start;
  padding: 32px;
  color: var(--xh-fg-default);
  background: var(--xh-bg-page);
  min-height: 100vh;
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
