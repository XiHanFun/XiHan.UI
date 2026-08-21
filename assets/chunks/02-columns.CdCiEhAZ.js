const n=`<!-- 逐档列数 | 列数写成断点对象，按容器自身的宽度换档：窄栏一列，宽到 md 两列，宽到 lg 四列 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle =
  "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cards = [
  { label: "甲", height: 80 },
  { label: "乙", height: 130 },
  { label: "丙", height: 60 },
  { label: "丁", height: 100 },
  { label: "戊", height: 90 },
  { label: "己", height: 120 },
  { label: "庚", height: 70 },
  { label: "辛", height: 110 },
];
<\/script>

<template>
  <XhMasonry :columns="{ base: 1, md: 2, lg: 4 }" gap="md">
    <div
      v-for="c in cards"
      :key="c.label"
      :style="\`\${cardStyle}; block-size: \${c.height}px\`"
    >
      {{ c.label }}
    </div>
  </XhMasonry>
</template>
`;export{n as default};
