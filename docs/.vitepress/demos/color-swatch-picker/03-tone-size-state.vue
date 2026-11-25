<!-- 语气、尺寸与状态 | tone 决定选中描边与选中徽标用哪族颜色，格子边长随控件行高分三档；禁用整组置灰，只读只阻止落值不阻止焦点，无效把描边转为警示色 -->
<script setup lang="ts">
import { XhColorSwatchPickerRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const sizes = ["sm", "md", "lg"] as const;
const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-6)">
      <XhColorSwatchPickerRoot
        v-for="t in tones"
        :key="t"
        :swatches="swatches"
        :label="t"
        :tone="t"
        size="sm"
        default-value="#f59e0b"
      />
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-6); align-items: flex-start">
      <XhColorSwatchPickerRoot
        v-for="s in sizes"
        :key="s"
        :swatches="swatches"
        :label="s"
        :size="s"
        default-value="#3b82f6"
      />
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-6)">
      <XhColorSwatchPickerRoot :swatches="swatches" default-value="#10b981" label="禁用" disabled />
      <XhColorSwatchPickerRoot :swatches="swatches" default-value="#10b981" label="只读" read-only />
      <XhColorSwatchPickerRoot :swatches="swatches" label="必填未选" invalid required />
    </div>
  </div>
</template>
