const n=`<!-- 输入组 | 圆角槽换成只留外侧的一组值，中缝用负外边距叠掉一条描边，相邻控件拼成一体 -->
<script setup lang="ts">
import {
  XhButton,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

const radius = "var(--xh-shape-control)";

// 输入框只留左侧圆角，右边一格外扣 1px 与按钮共用一条描边
const searchInput = \`inline-size: 220px; margin-inline-end: -1px; --xh-text-field-input-radius: \${radius} 0 0 \${radius}\`;
const searchButton = \`--xh-button-radius: 0 \${radius} \${radius} 0\`;

// 前后两块固定文本与输入框同高同描边，圆角各留一侧
const addonBase =
  "display: inline-flex; align-items: center; block-size: var(--xh-control-h-md); padding-inline: 12px; border: 1px solid var(--xh-border-default); background: var(--xh-bg-subtle); color: var(--xh-fg-muted); font-size: var(--xh-text-body-size)";
const addonStart = \`\${addonBase}; border-radius: \${radius} 0 0 \${radius}\`;
const addonEnd = \`\${addonBase}; border-radius: 0 \${radius} \${radius} 0\`;
const middleInput = "inline-size: 160px; margin-inline: -1px; --xh-text-field-input-radius: 0";
<\/script>

<template>
  <XhTextFieldRoot placeholder="搜索文档" clearable>
    <XhTextFieldLabel>站内搜索</XhTextFieldLabel>
    <div style="display: flex">
      <XhTextFieldInput :style="searchInput" />
      <XhButton :style="searchButton">搜索</XhButton>
    </div>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="xihanfun">
    <XhTextFieldLabel>域名</XhTextFieldLabel>
    <div style="display: flex">
      <span :style="addonStart">https://</span>
      <XhTextFieldInput :style="middleInput" />
      <span :style="addonEnd">.com</span>
    </div>
  </XhTextFieldRoot>
</template>
`;export{n as default};
