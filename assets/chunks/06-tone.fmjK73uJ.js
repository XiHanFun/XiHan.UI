const n=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴 -->
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhComboboxRoot
      v-for="t in tones"
      :key="t"
      variant="subtle"
      :tone="t"
      :collection="fruits"
      clearable
      :label="t"
      open-on-click
      placeholder="选择水果"
      style="width: 200px"
    />
  </div>
</template>
`;export{n as default};
