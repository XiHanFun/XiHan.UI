const n=`<!-- 指示器与禁用 | indicator 的朝向由 data-state 驱动，禁用项点不动、方向键也跳过它 -->
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const items = [
  {
    value: "ready",
    label: "已发布",
    content: "标题右侧那个箭头就是 indicator，展开时自动翻转。",
  },
  {
    value: "draft",
    label: "草稿（禁用）",
    content: "这一项展不开。",
    disabled: true,
  },
  {
    value: "archived",
    label: "已归档",
    content: "从第一项按方向键，会直接跳到这里。",
  },
];
<\/script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :collection="items" :default-value="['ready']" />
  </div>
</template>
`;export{n as default};
