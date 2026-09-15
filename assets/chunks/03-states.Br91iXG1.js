const e=`<!-- 状态 | 禁用整组置灰、只读只挡落值不挡焦点、无效把描边转成警示色 -->
<script setup lang="ts">
import { XhColorSwatchPickerRoot } from "@xihan-ui/vue";

const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhColorSwatchPickerRoot :swatches="swatches" default-value="#10b981" label="禁用" disabled />
    <XhColorSwatchPickerRoot :swatches="swatches" default-value="#10b981" label="只读" read-only />
    <XhColorSwatchPickerRoot :swatches="swatches" label="必填未选" invalid required />
  </div>
</template>
`;export{e as default};
