<script setup lang="ts">
import { createThemeController } from '@xihan-ui/system/runtime'
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from '@xihan-ui/vue'
import { ref } from 'vue'

const theme = createThemeController()
const mode = ref(theme.getState().mode)
function toggleTheme() {
  const next = mode.value === 'light' ? 'dark' : 'light'
  theme.setPreference({ mode: next })
  mode.value = next
}
</script>

<template>
  <main>
    <h1>XiHan.UI Playground</h1>

    <section>
      <h2>Button</h2>
      <div class="row">
        <XhButton variant="solid">
          Solid
        </XhButton>
        <XhButton>Subtle</XhButton>
        <XhButton variant="outline">
          Outline
        </XhButton>
        <XhButton variant="ghost">
          Ghost
        </XhButton>
        <XhButton disabled>
          Disabled
        </XhButton>
        <XhButton loading>
          Loading
        </XhButton>
        <XhButton size="sm">
          Small
        </XhButton>
        <XhButton size="lg">
          Large
        </XhButton>
        <XhButton variant="outline" @click="toggleTheme">
          切换 {{ mode === 'light' ? '深色' : '浅色' }}
        </XhButton>
      </div>
    </section>

    <section>
      <h2>Dialog</h2>
      <div class="row">
        <XhDialogRoot v-slot="{ setOpen }">
          <XhDialogTrigger>打开对话框</XhDialogTrigger>
          <XhDialogContent>
            <XhDialogTitle>确认操作</XhDialogTitle>
            <XhDialogDescription>
              这是一个模态对话框：焦点被陷入、背景滚动被锁定、Esc 或点击遮罩可关闭。
            </XhDialogDescription>
            <div class="row" style="justify-content: flex-end; margin-block-start: 8px;">
              <XhButton variant="ghost" @click="setOpen(false)">
                取消
              </XhButton>
              <XhButton variant="solid" @click="setOpen(false)">
                确定
              </XhButton>
            </div>
            <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
          </XhDialogContent>
        </XhDialogRoot>
      </div>
    </section>
  </main>
</template>
