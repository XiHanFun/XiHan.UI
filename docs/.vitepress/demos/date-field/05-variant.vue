<!-- 形态 | variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变 -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhDateFieldRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDateFieldLabel>{{ v }}</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
