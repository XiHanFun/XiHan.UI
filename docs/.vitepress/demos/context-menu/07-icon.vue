<!-- 条目里的图标与快捷键 | item-text 只是文字那一段，图标与快捷键提示作为兄弟节点排在它两侧 -->
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
  XhIcon,
} from "@xihan-ui/vue";

// 描边取 currentColor，图标颜色随条目文字色走，禁用态也一并跟着变淡
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const CutIcon = {
  name: "cut",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "circle", attrs: { cx: "6", cy: "18", r: "3" } },
    { tag: "circle", attrs: { cx: "18", cy: "18", r: "3" } },
    { tag: "path", attrs: { d: "M8 16L18 4M16 16L6 4" } },
  ],
} as const;

const PasteIcon = {
  name: "paste",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "rect", attrs: { x: "5", y: "4", width: "14", height: "17", rx: "2" } },
    { tag: "path", attrs: { d: "M9 4V3H15V4" } },
  ],
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

// item-text 会撑满剩余宽度，快捷键提示自然被顶到条目末端
const hintStyle = {
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot>
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>右键看带图标与快捷键的条目</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="cut">
            <XhIcon :icon="CutIcon" size="sm" />
            <XhContextMenuItemText>剪切</XhContextMenuItemText>
            <span :style="hintStyle">Ctrl+X</span>
          </XhContextMenuItem>
          <XhContextMenuItem value="paste" disabled>
            <XhIcon :icon="PasteIcon" size="sm" />
            <XhContextMenuItemText>粘贴</XhContextMenuItemText>
            <span :style="hintStyle">Ctrl+V</span>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhIcon :icon="TrashIcon" size="sm" />
            <XhContextMenuItemText>删除</XhContextMenuItemText>
            <span :style="hintStyle">Del</span>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  </div>
</template>
