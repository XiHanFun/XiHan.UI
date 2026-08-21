const n=`<!-- 可及名字 | 命名只有两态：给了非空白 label 就是 role="img" + aria-label，没给就是 aria-hidden="true" 的装饰件 -->
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

const PlusIcon = {
  name: "plus",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 5V19" } },
    { tag: "path", attrs: { d: "M5 12H19" } },
  ],
} as const;

const XIcon = {
  name: "x",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M6 6L18 18" } },
    { tag: "path", attrs: { d: "M18 6L6 18" } },
  ],
} as const;
<\/script>

<template>
  <!-- 旁边已经有文字说这件事，图标不给 label，读屏不会把「加号 新建」念两遍 -->
  <span style="display: inline-flex; align-items: center; gap: 6px;">
    <XhIcon :icon="PlusIcon" />新建
  </span>

  <!-- 图标是这里唯一说出「关闭」的东西，必须给 label -->
  <span style="display: inline-flex; align-items: center; gap: 6px;">
    <XhIcon :icon="XIcon" label="关闭" />
    <span style="font-size: 13px;">这枚没有可见文字，名字只能由 label 给</span>
  </span>
</template>
`;export{n as default};
