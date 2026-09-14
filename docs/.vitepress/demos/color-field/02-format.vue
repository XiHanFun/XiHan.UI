<!-- 写法与透明度 | 手打的任何写法收下后都按 format 重写；开 alpha 才保留透明度，配合 rgba 写法一眼看得出 -->
<script setup lang="ts">
import {
  XhColorFieldControl,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("rgba(59, 130, 246, 0.5)");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <!-- 试着打 #3b82f680 或 hsl(217 91% 60% / 50%)，收下后都变成 rgba() -->
    <XhColorFieldRoot v-model:value="value" format="rgba" alpha placeholder="rgba(r, g, b, a)">
      <XhColorFieldLabel>遮罩色</XhColorFieldLabel>
      <XhColorFieldControl style="inline-size: 20rem">
        <XhColorFieldSwatch />
        <XhColorFieldInput />
      </XhColorFieldControl>
    </XhColorFieldRoot>
    <span style="font-size: 13px">收下的值：<code>{{ value || "（空）" }}</code></span>
  </div>
</template>
