<!-- 基础用法 | collection 是条目的事实源：文本与禁用都写在数据里，trigger / positioner / content / item 由组件铺开 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhMenuRoot } from "@xihan-ui/vue";

const actions = [
  { value: "copy", label: "复制" },
  { value: "paste", label: "粘贴" },
  // 禁用项会被方向键跳过，也选不中；separatorBefore 在它前面隔一道
  { value: "delete", label: "删除", disabled: true, separatorBefore: true },
];

const picked = ref("");

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}
</script>

<template>
  <!-- 触发器的内容归作者，走 trigger 插槽 -->
  <XhMenuRoot :collection="actions" @select="onSelect">
    <template #trigger>操作</template>
  </XhMenuRoot>
  <span>最近选中：{{ picked || "（无）" }}</span>
</template>
