const n=`<!-- 语气 | tone 决定选中圆点用哪族颜色，六种语气各一组 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const answers = [
  { value: "yes", label: "选中" },
  { value: "no", label: "未选" },
];
<\/script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRadioGroupRoot
      v-for="t in tones"
      :key="t"
      :collection="answers"
      :label="t"
      :tone="t"
      default-value="yes"
    />
  </div>
</template>
`;export{n as default};
