<!-- 分组 | 使用标题与分隔线组织命令 -->
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

const commands = [
  { value: "name", label: "按名称", indicator: "", group: "sort", groupLabel: "排序方式" },
  { value: "time", label: "按修改时间", group: "sort" },
  { value: "list", label: "列表", group: "view", groupLabel: "视图", separatorBefore: true },
  { value: "grid", label: "网格", group: "view" },
];
</script>

<template>
  <XhContextMenuRoot :collection="commands">
    <template #trigger>
      <span
        style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
      >
        右键设置文件视图
      </span>
    </template>
  </XhContextMenuRoot>
</template>
