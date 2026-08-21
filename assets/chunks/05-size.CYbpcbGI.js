const e=`<!-- 尺寸 | size 换的是整块正文的字号与段间距，不传 size 即默认档 -->
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <XhTypographyRoot v-for="s in sizes" :key="s.label" :size="s.size">
      <XhTypographyHeading :level="4">{{ s.label }}档</XhTypographyHeading>
      <XhTypographyParagraph>正文字号与段间距跟着档位走，标题档位另由 level 决定。</XhTypographyParagraph>
    </XhTypographyRoot>
  </div>
</template>
`;export{e as default};
