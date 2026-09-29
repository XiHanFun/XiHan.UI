const e=`<!-- 标签内容 | labelContent 决定标签写什么：取 name-value 等内建写法，或给函数自己拼；返回空串的扇区不写标签 -->
<script setup lang="ts">
import type { PieLabelDetails } from "@xihan-ui/headless";
import { XhPieChartRoot } from "@xihan-ui/vue";

const rows = [
  { category: "服饰", revenue: 386 },
  { category: "数码", revenue: 274 },
  { category: "家居", revenue: 158 },
  { category: "美妆", revenue: 96 },
  { category: "图书", revenue: 42 },
];

// 写金额与占比两样；不到 5% 的扇区交给图例与提示框
function labelOf(slice: PieLabelDetails): string {
  return slice.share < 0.05 ? "" : \`\${slice.name} \${slice.formatted.value} 万（\${slice.formatted.share}）\`;
}
<\/script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="category"
    value-field="revenue"
    :label-content="labelOf"
  >
    <template #caption>各品类营收</template>
  </XhPieChartRoot>
</template>
`;export{e as default};
