<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 面板 portal 到这块预览根里；卡片的 contain: layout paint 把 fixed 定位层圈成卡内包含块
const host = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="host"
    style="position: relative; display: grid; place-items: start; inline-size: var(--xh-doc-catalog-w); block-size: var(--xh-doc-catalog-h); --xh-dialog-max-w: var(--xh-doc-catalog-w)"
  >
    <XhDialogRoot v-if="host" default-open :modal="false" :close-on-interact-outside="false" :translations="{ close: '关闭' }">
      <XhDialogTrigger>打开对话框</XhDialogTrigger>
      <XhDialogContent :container="host">
        <XhDialogTitle>确认发布</XhDialogTitle>
        <XhDialogDescription>发布后这篇文档对所有人可见，之后仍可撤回。</XhDialogDescription>
        <div style="display: flex; justify-content: flex-end">
          <XhButton>发布</XhButton>
        </div>
        <XhDialogCloseTrigger />
      </XhDialogContent>
    </XhDialogRoot>
  </div>
</template>
