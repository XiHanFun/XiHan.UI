const n=`<!-- 尺寸与语气 | 格子边长跟着控件行高走三档；tone 决定选中环与选中标记用哪族颜色 -->
<script setup lang="ts">
import { XhColorSwatchPickerRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start">
      <XhColorSwatchPickerRoot
        v-for="s in sizes"
        :key="s"
        :swatches="swatches"
        :label="s"
        :size="s"
        default-value="#3b82f6"
      />
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 24px">
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
  </div>
</template>
`;export{n as default};
