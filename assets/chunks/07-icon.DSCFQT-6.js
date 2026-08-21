const n=`<!-- 入口与条目的图标 | 图标是插槽里的普通节点：入口里排在文字前，条目里排在 item-text 前，逐项自己写 -->
<script setup lang="ts">
import {
  XhIcon,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

// 描边取 currentColor，图标颜色随入口与条目当下的文字色走
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const FileIcon = {
  name: "file",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M13 3H7A2 2 0 0 0 5 5V19A2 2 0 0 0 7 21H17A2 2 0 0 0 19 19V9Z" } },
    { tag: "path", attrs: { d: "M13 3V9H19" } },
  ],
} as const;

const EditIcon = {
  name: "edit",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 20H8L19 9A2.8 2.8 0 0 0 15 5L4 16Z" } }],
} as const;

const PlusIcon = {
  name: "plus",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M12 5V19M5 12H19" } }],
} as const;

const FolderIcon = {
  name: "folder",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M3 7A2 2 0 0 1 5 5H9L11 8H19A2 2 0 0 1 21 10V17A2 2 0 0 1 19 19H5A2 2 0 0 1 3 17Z" } },
  ],
} as const;

const SaveIcon = {
  name: "save",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M5 4H16L20 8V19A1 1 0 0 1 19 20H5A1 1 0 0 1 4 19V5A1 1 0 0 1 5 4Z" } },
    { tag: "path", attrs: { d: "M8 4V9H15" } },
  ],
} as const;
<\/script>

<template>
  <div style="inline-size: 100%; padding-block-end: 160px">
    <XhMenubarRoot>
      <XhMenubarTrigger value="file">
        <XhIcon :icon="FileIcon" size="sm" />
        文件
      </XhMenubarTrigger>
      <XhMenubarTrigger value="edit">
        <XhIcon :icon="EditIcon" size="sm" />
        编辑
      </XhMenubarTrigger>

      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="new">
            <XhIcon :icon="PlusIcon" size="sm" />
            <XhMenubarItemText>新建</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarItem value="open">
            <XhIcon :icon="FolderIcon" size="sm" />
            <XhMenubarItemText>打开</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarSeparator />
          <XhMenubarItem value="save">
            <XhIcon :icon="SaveIcon" size="sm" />
            <XhMenubarItemText>保存</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>

      <XhMenubarPositioner value="edit">
        <XhMenubarContent>
          <XhMenubarItem value="undo">
            <XhMenubarItemText>撤销</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarItem value="redo">
            <XhMenubarItemText>重做</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>
  </div>
</template>
`;export{n as default};
