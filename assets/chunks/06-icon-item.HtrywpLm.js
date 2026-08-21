const n=`<!-- 图标条目 | 只画图标的条目必须自带无障碍名：aria-label 直接写在条目上，透传到那一层 DOM -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhIcon,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

// 描边取 currentColor，图标颜色随条目文字色走
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const UndoIcon = {
  name: "undo",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M4 10H15A5 5 0 0 1 15 20H10" } },
    { tag: "path", attrs: { d: "M8 6L4 10L8 14" } },
  ],
} as const;

const RedoIcon = {
  name: "redo",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M20 10H9A5 5 0 0 0 9 20H14" } },
    { tag: "path", attrs: { d: "M16 6L20 10L16 14" } },
  ],
} as const;

const AlignLeftIcon = {
  name: "align-left",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 6H20M4 12H14M4 18H18" } }],
} as const;

const AlignCenterIcon = {
  name: "align-center",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 6H20M7 12H17M5 18H19" } }],
} as const;

const AlignRightIcon = {
  name: "align-right",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 6H20M10 12H20M6 18H20" } }],
} as const;

// 条目的观感归条目自己，工具条只补焦点环与禁用光标
const itemStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
  color: "inherit",
};

const command = ref("（无）");
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhToolbarRoot>
      <XhToolbarItem
        value="undo"
        :style="itemStyle"
        aria-label="撤销"
        @click="command = '撤销'"
      >
        <XhIcon :icon="UndoIcon" size="sm" />
      </XhToolbarItem>
      <XhToolbarItem
        value="redo"
        :style="itemStyle"
        aria-label="重做"
        @click="command = '重做'"
      >
        <XhIcon :icon="RedoIcon" size="sm" />
      </XhToolbarItem>

      <XhToolbarSeparator />

      <XhToolbarGroup>
        <XhToolbarItem
          value="align-left"
          :style="itemStyle"
          aria-label="左对齐"
          @click="command = '左对齐'"
        >
          <XhIcon :icon="AlignLeftIcon" size="sm" />
        </XhToolbarItem>
        <XhToolbarItem
          value="align-center"
          :style="itemStyle"
          aria-label="居中"
          @click="command = '居中'"
        >
          <XhIcon :icon="AlignCenterIcon" size="sm" />
        </XhToolbarItem>
        <XhToolbarItem
          value="align-right"
          :style="itemStyle"
          aria-label="右对齐"
          @click="command = '右对齐'"
        >
          <XhIcon :icon="AlignRightIcon" size="sm" />
        </XhToolbarItem>
      </XhToolbarGroup>
    </XhToolbarRoot>

    <span>最近点击：{{ command }}</span>
  </div>
</template>
`;export{n as default};
