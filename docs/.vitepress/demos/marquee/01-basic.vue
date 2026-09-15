<!-- 基础用法 | 窗口只显示一段，轨道在其中向左滚动；滚动整段在皮肤的 @keyframes 中，使用者不写动画 -->
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const notices = [
  "系统将于本周六 02:00 起停机维护两小时",
  "新版导出支持按列脱敏",
  "本月账单已生成",
];
</script>

<template>
  <XhMarqueeRoot style="max-inline-size: 420px">
    <XhMarqueeContent>
      <span v-for="n in notices" :key="n" style="margin-inline-end: 32px; white-space: nowrap">
        {{ n }}
      </span>
    </XhMarqueeContent>
  </XhMarqueeRoot>
</template>
