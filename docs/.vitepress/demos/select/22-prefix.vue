<!-- 行首与行尾 | 两格交给作者，文字与副文本仍由数据铺 -->
<script setup lang="ts">
import type { SelectNode, SelectNodeMeta } from "@xihan-ui/headless";
import { XhSelectRoot } from "@xihan-ui/vue";

const states: SelectNode[] = [
  { value: "open", label: "进行中", description: "已排期，尚未合并" },
  { value: "merged", label: "已合并", description: "进入主干" },
  { value: "closed", label: "已关闭", description: "不再处理" },
];

const dot = { open: "var(--xh-fg-warning)", merged: "var(--xh-fg-success)", closed: "var(--xh-fg-muted)" };
const count = { open: 12, merged: 148, closed: 31 };
const key = (node: SelectNodeMeta): keyof typeof dot => node.value as keyof typeof dot;
</script>

<template>
  <XhSelectRoot :collection="states" :default-value="['open']" label="状态" placeholder="请选择">
    <template #item-prefix="node">
      <span :style="{ display: 'block', inlineSize: '8px', blockSize: '8px', borderRadius: 'var(--xh-shape-pill)', background: dot[key(node)] }" />
    </template>
    <template #item-suffix="node">
      <span style="color: var(--xh-fg-muted); font-size: var(--xh-control-caption-md)">{{ count[key(node)] }}</span>
    </template>
  </XhSelectRoot>
</template>
