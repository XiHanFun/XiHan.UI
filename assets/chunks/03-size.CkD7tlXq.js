const t=`<!-- 尺寸 | size 换的是标签、数值与前后缀的字号，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 40px">
    <XhStatisticRoot v-for="s in sizes" :key="s.label" :size="s.size">
      <XhStatisticLabel>{{ s.label }}</XhStatisticLabel>
      <XhStatisticValue>86.7</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>
  </div>
</template>
`;export{t as default};
