<script setup lang="ts">
import {
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 局部抽屉：容器既是 portal 落点又触发 data-contained，遮罩与面板从 fixed 换成 absolute 贴容器边
const host = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="host"
    style="position: relative; overflow: hidden; padding: var(--xh-space-3); inline-size: var(--xh-doc-catalog-w); block-size: var(--xh-doc-catalog-h); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); --xh-drawer-size: 70%"
  >
    <XhDrawerRoot v-if="host" :container="host" default-open :modal="false" :close-on-interact-outside="false" :translations="{ close: '关闭' }">
      <XhDrawerTrigger>打开抽屉</XhDrawerTrigger>
      <XhDrawerContent>
        <XhDrawerTitle>筛选条件</XhDrawerTitle>
        <XhDrawerDescription>贴着容器右沿展开。</XhDrawerDescription>
        <XhDrawerCloseTrigger />
      </XhDrawerContent>
    </XhDrawerRoot>
  </div>
</template>
