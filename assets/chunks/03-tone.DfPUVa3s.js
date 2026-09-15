const n=`<!-- 语气 | tone 决定用哪族颜色；语气只换色相，形态与尺寸不受影响 -->
<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot
      v-for="tone in tones"
      :key="tone.value"
      variant="subtle"
      :tone="tone.value"
    >
      <XhTagLabel>{{ tone.label }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
`;export{n as default};
