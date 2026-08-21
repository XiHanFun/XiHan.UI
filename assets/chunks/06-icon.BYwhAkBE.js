const n=`<!-- 图标与文字 | 图元放进 prefix 或 suffix 部件，文字放进 label；两个图元部件自带 aria-hidden，读屏念到的只有 label -->
<script setup lang="ts">
import { XhButton, XhButtonLabel, XhButtonPrefix, XhButtonSuffix, XhIcon } from "@xihan-ui/vue";

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

const ArrowRightIcon = {
  name: "arrow-right",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M4 12H20" } },
    { tag: "path", attrs: { d: "M13 5L20 12L13 19" } },
  ],
} as const;
<\/script>

<template>
  <!-- 图元在前 -->
  <XhButton variant="solid">
    <XhButtonPrefix>
      <XhIcon :icon="PlusIcon" size="sm" />
    </XhButtonPrefix>
    <XhButtonLabel>新建</XhButtonLabel>
  </XhButton>

  <!-- 图元在后：换个部件就行，root 的 gap 两边通用 -->
  <XhButton variant="outline">
    <XhButtonLabel>下一步</XhButtonLabel>
    <XhButtonSuffix>
      <XhIcon :icon="ArrowRightIcon" size="sm" />
    </XhButtonSuffix>
  </XhButton>

  <!-- 前后各一枚 -->
  <XhButton variant="subtle" tone="success">
    <XhButtonPrefix>
      <XhIcon :icon="PlusIcon" size="sm" />
    </XhButtonPrefix>
    <XhButtonLabel>再来一件</XhButtonLabel>
    <XhButtonSuffix>
      <XhIcon :icon="ArrowRightIcon" size="sm" />
    </XhButtonSuffix>
  </XhButton>
</template>
`;export{n as default};
