<!-- 贴边方向 | side 只落成 data-side，面板压在哪条边由皮肤按这个值决定；root 与 content 报的是同一条边 -->
<script setup lang="ts">
import {
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

const sides = [
  { value: "left", label: "左侧" },
  { value: "right", label: "右侧" },
  { value: "top", label: "顶部" },
  { value: "bottom", label: "底部" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhDrawerRoot
      v-for="s in sides"
      :key="s.value"
      v-slot="{ side }"
      :side="s.value"
      :translations="{ close: '关闭' }"
    >
      <XhDrawerTrigger>{{ s.label }}</XhDrawerTrigger>
      <XhDrawerContent>
        <XhDrawerTitle>{{ s.label }}抽屉</XhDrawerTitle>
        <XhDrawerDescription>
          当前 data-side 是 {{ side }}。
        </XhDrawerDescription>
        <XhDrawerCloseTrigger />
      </XhDrawerContent>
    </XhDrawerRoot>
  </div>
</template>
