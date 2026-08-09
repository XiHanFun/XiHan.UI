<!-- 禁用 | disabled 只关掉提示本身，被包裹的触发器照样可点、可聚焦 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const clicks = ref(0);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhTooltipRoot disabled>
      <XhTooltipTrigger @click="clicks++">点我（提示已关）</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>这段话不会出现</XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
    <span>已点 {{ clicks }} 次</span>
  </div>
</template>
