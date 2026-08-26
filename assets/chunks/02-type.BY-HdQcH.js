const n=`<!-- 语气 | type 落成 data-type，淡底、描边与字形一起换族，正文留中性；error 走 alert + assertive，loading 表示事情还没完、不自动消失 -->
<script setup lang="ts">
import {
  CheckIcon,
  CircleInfoIcon,
  LoaderIcon,
  TriangleAlertIcon,
  XIcon,
} from "@xihan-ui/icons";
import { XhIcon, XhToastRoot, XhToastTitle } from "@xihan-ui/vue";

const items = [
  { type: "info", glyph: CircleInfoIcon, title: "草稿已保存" },
  { type: "success", glyph: CheckIcon, title: "发布成功" },
  { type: "warning", glyph: TriangleAlertIcon, title: "配额即将用尽" },
  { type: "error", glyph: XIcon, title: "同步失败，稍后自动重试" },
  { type: "loading", glyph: LoaderIcon, title: "正在上传" },
] as const;

// 字形只是装饰（读屏念标题就够了），颜色跟着 root 上由 type 派生的 data-tone 走
const glyphStyle = {
  display: "grid",
  placeItems: "center",
  flex: "none",
  inlineSize: "var(--xh-icon-size)",
  blockSize: "var(--xh-icon-size)",
  color: "var(--xh-_tone-fg)",
};
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      v-for="item in items"
      :key="item.type"
      :type="item.type"
      :title="item.title"
      :duration="0"
      :closable="false"
    >
      <span aria-hidden="true" :style="glyphStyle"><XhIcon :icon="item.glyph" /></span>
      <XhToastTitle />
    </XhToastRoot>
  </div>
</template>
`;export{n as default};
