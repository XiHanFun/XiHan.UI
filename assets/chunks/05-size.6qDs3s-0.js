const e=`<!-- 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一块触发区，逐块右键对比 -->
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "lg" },
] as const;

const commands = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

// 三块触发区共用一份外观，尺寸差别只由 size 造成
const triggerStyle = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "96px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
};
<\/script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <XhContextMenuRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      :collection="commands"
    >
      <template #trigger>
        <span :style="triggerStyle">{{ s.label }}</span>
      </template>
    </XhContextMenuRoot>
  </div>
</template>
`;export{e as default};
