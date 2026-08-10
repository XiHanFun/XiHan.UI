<!-- 尺寸 | size 换的是每格的内边距、组与组的间距与整体字号，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "状态", value: "已发货" },
  { label: "承运商", value: "顺丰速运" },
];

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <XhDescriptionsRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      bordered
      :columns="2"
      placement="left"
    >
      <XhDescriptionsItem v-for="row in rows" :key="row.label">
        <XhDescriptionsLabel>{{ s.label }} · {{ row.label }}</XhDescriptionsLabel>
        <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
      </XhDescriptionsItem>
    </XhDescriptionsRoot>
  </div>
</template>
