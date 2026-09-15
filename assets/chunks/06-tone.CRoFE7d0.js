const n=`<!-- 语气 | tone 决定指示器与选中段文字用哪族颜色，六种语气各一组 -->
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const tones = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
  "info",
] as const;
const answers = [
  { value: "on", label: "开" },
  { value: "off", label: "关" },
];
<\/script>

<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <XhSegmentedRoot
      v-for="t in tones"
      :key="t"
      :collection="answers"
      :tone="t"
      :aria-label="t"
      default-value="on"
    />
  </div>
</template>
`;export{n as default};
