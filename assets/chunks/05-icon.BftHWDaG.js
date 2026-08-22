const n=`<!-- 图标由作者塞 | 库不带插画资产，图标位收任意内容：字形、图标组件、手写的内联 svg 都行 -->
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhResultDescription,
  XhResultIcon,
  XhResultRoot,
  XhResultTitle,
} from "@xihan-ui/vue";

// 图标记录只带几何，颜色取 currentColor，于是跟着结果的语气色走
const CheckCircleIcon = {
  name: "check-circle",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
    { tag: "path", attrs: { d: "M8 12.5L11 15.5L16 9" } },
  ],
} as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <!-- 一个字形 -->
    <XhResultRoot status="success" size="sm" style="inline-size: 200px">
      <XhResultIcon><XhIcon :icon="CheckIcon" /></XhResultIcon>
      <XhResultTitle>字形</XhResultTitle>
      <XhResultDescription>字号跟着图标框走。</XhResultDescription>
    </XhResultRoot>

    <!-- 一枚 XhIcon，不写 tone，颜色从结果的语气色继承下来 -->
    <XhResultRoot status="success" size="sm" style="inline-size: 200px">
      <XhResultIcon>
        <XhIcon :icon="CheckCircleIcon" size="lg" />
      </XhResultIcon>
      <XhResultTitle>图标组件</XhResultTitle>
      <XhResultDescription>记录传给 XhIcon，颜色继承下来。</XhResultDescription>
    </XhResultRoot>

    <!-- 手写内联 svg，同样取 currentColor -->
    <XhResultRoot status="success" size="sm" style="inline-size: 200px">
      <XhResultIcon>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 12.5L9 17.5L20 6.5" />
        </svg>
      </XhResultIcon>
      <XhResultTitle>内联 svg</XhResultTitle>
      <XhResultDescription>自己写的图形也照样收。</XhResultDescription>
    </XhResultRoot>
  </div>
</template>
`;export{n as default};
