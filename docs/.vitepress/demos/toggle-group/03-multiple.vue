<!-- 多选 | multiple 换的是整套 ARIA：root 退回 group、条目退回原生按钮 + aria-pressed，值也从字符串变成数组 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";

const marks = ref<string[]>(["bold"]);
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="marks" multiple>
      <XhToggleGroupItem value="bold">B</XhToggleGroupItem>
      <XhToggleGroupItem value="italic">I</XhToggleGroupItem>
      <XhToggleGroupItem value="underline">U</XhToggleGroupItem>
    </XhToggleGroupRoot>
    <span style="font-size: 13px;">当前：{{ marks.join("、") || "（无选中）" }}</span>
  </span>

  <!-- 竖排只改视觉排布，方向键接受的轴与它无关，四个方向键恒响应 -->
  <XhToggleGroupRoot multiple orientation="vertical" :default-value="['grid']">
    <XhToggleGroupItem value="grid">网格</XhToggleGroupItem>
    <XhToggleGroupItem value="ruler">标尺</XhToggleGroupItem>
    <XhToggleGroupItem value="guide">参考线</XhToggleGroupItem>
  </XhToggleGroupRoot>
</template>
