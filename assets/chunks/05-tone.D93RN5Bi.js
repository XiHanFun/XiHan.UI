const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 颜色 | tone 落在展开态的标题上，六种颜色各预置一项展开做对照 -->
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
].map(tone => ({
  ...tone,
  panels: [
    {
      value: "open",
      label: \`\${tone.label}（展开）\`,
      content: \`tone="\${tone.value}"\`,
    },
    {
      value: "closed",
      label: \`\${tone.label}（收起）\`,
      content: "收起态标题保持默认颜色。",
    },
  ],
}));
<\/script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    "
  >
    <XhAccordionRoot
      v-for="tone in tones"
      :key="tone.value"
      :tone="tone.value"
      :collection="tone.panels"
      :default-value="['open']"
    />
  </div>
</template>
`;export{n as default};
