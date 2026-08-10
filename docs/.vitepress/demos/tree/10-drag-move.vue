<!-- 拖放换父 | 树从不拥有数据：把 draggable 与拖放监听补在节点上，落点判定与数组搬运都在宿主这边，改完 collection 树自己重推层级 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

interface Doc {
  value: string;
  label: string;
}

interface Folder {
  value: string;
  label: string;
  children: Doc[];
}

const collection = ref<Folder[]>([
  {
    value: "inbox",
    label: "收件箱",
    children: [
      { value: "f1", label: "报价单.pdf" },
      { value: "f2", label: "周报.md" },
    ],
  },
  {
    value: "archive",
    label: "归档",
    children: [{ value: "f3", label: "去年总结.docx" }],
  },
  { value: "trash", label: "回收站", children: [] },
]);

const dragging = ref<string | null>(null);
const over = ref<string | null>(null);
const log = ref("把文件拖到别的目录上放开");

function onDragStart(event: DragEvent, value: string): void {
  dragging.value = value;
  // 不写载荷有些浏览器不认这次拖拽
  event.dataTransfer?.setData("text/plain", value);
}

function onDragEnd(): void {
  dragging.value = null;
  over.value = null;
}

function onDrop(folder: string): void {
  const value = dragging.value;
  onDragEnd();
  if (value == null) return;
  const from = collection.value.find((f) => f.children.some((c) => c.value === value));
  const to = collection.value.find((f) => f.value === folder);
  // 同一个目录里放开不算搬家
  if (!from || !to || from === to) return;
  const index = from.children.findIndex((c) => c.value === value);
  const [moved] = from.children.splice(index, 1);
  to.children.push(moved);
  log.value = `${moved.label} 移到了 ${to.label}`;
}

const dropStyle = {
  outline: "2px dashed var(--xh-border-strong)",
  outlineOffset: "-2px",
};
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      :collection="collection"
      :default-expanded-value="['inbox', 'archive', 'trash']"
    >
      <XhTreeLabel>邮箱目录</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="folder in collection" :key="folder.value" :value="folder.value">
          <!-- 落点是目录那一行：拖过去时描一圈虚线，放开就搬 -->
          <XhTreeBranchControl
            :style="over === folder.value ? dropStyle : undefined"
            @dragover.prevent="over = folder.value"
            @dragleave="over = null"
            @drop.prevent="onDrop(folder.value)"
          >
            <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
            <XhTreeBranchText>{{ folder.label }}</XhTreeBranchText>
            <span style="margin-inline-start: auto">{{ folder.children.length }}</span>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem
              v-for="file in folder.children"
              :key="file.value"
              :value="file.value"
              draggable="true"
              :style="dragging === file.value ? { opacity: 0.5 } : undefined"
              @dragstart="onDragStart($event, file.value)"
              @dragend="onDragEnd"
            >
              <span aria-hidden="true">📄</span>
              <XhTreeItemText>{{ file.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>{{ log }}</span>
  </div>
</template>
