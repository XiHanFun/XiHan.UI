const e=`<!-- 颜色 | 使用预设语义颜色 -->
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const tones = [
  { label: "品牌", value: "brand" },
  { label: "成功", value: "success" },
  { label: "警告", value: "warning" },
  { label: "危险", value: "danger" },
  { label: "信息", value: "info" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 24px; font-weight: 700">
    <XhGradientText v-for="tone in tones" :key="tone.value" :tone="tone.value">{{ tone.label }}</XhGradientText>
  </div>
</template>
`;export{e as default};
