<!-- 条目里的图标与快捷键 | 条目内容归作者：前面挂图标、后面挂快捷键，皮肤把它们按 flex 排开 -->
<script setup lang="ts">
import {
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";

// 三个图标共用一套描边呈现属性，stroke 取 currentColor，颜色随条目的文字色走
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const CopyIcon = {
  name: "copy",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "rect", attrs: { x: "9", y: "9", width: "11", height: "11", rx: "2" } },
    { tag: "path", attrs: { d: "M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5" } },
  ],
} as const;

const EditIcon = {
  name: "edit",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 20H8L19 9A2.8 2.8 0 0 0 15 5L4 16Z" } }],
} as const;

const TrashIcon = {
  name: "trash",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M4 7H20" } },
    { tag: "path", attrs: { d: "M10 11V17M14 11V17" } },
    { tag: "path", attrs: { d: "M6 7L7 20H17L18 7" } },
  ],
} as const;

// 快捷键提示推到条目末端，颜色压暗一档
const hintStyle = {
  marginInlineStart: "auto",
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger>编辑</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="copy">
          <XhIcon :icon="CopyIcon" size="sm" />
          <span>复制</span>
          <span :style="hintStyle">Ctrl+C</span>
        </XhMenuItem>
        <XhMenuItem value="rename">
          <XhIcon :icon="EditIcon" size="sm" />
          <span>重命名</span>
          <span :style="hintStyle">F2</span>
        </XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="delete">
          <XhIcon :icon="TrashIcon" size="sm" />
          <span>删除</span>
          <span :style="hintStyle">Del</span>
        </XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
