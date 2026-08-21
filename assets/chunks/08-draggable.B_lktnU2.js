const n=`<!-- 拖动标题栏挪窗口 | 指针按在标题上，顺着 DOM 找到 content 部件，把累计位移写进它的 translate；入场动画走的是 transform，两者互不覆盖 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";

const offset = ref({ x: 0, y: 0 });
const dragging = ref(false);
let panel: HTMLElement | null = null;
let startX = 0;
let startY = 0;

function begin(event: PointerEvent): void {
  const handle = event.currentTarget as HTMLElement;
  panel = handle.closest<HTMLElement>('[data-scope="dialog"][data-part="content"]');
  if (!panel) return;
  dragging.value = true;
  startX = event.clientX - offset.value.x;
  startY = event.clientY - offset.value.y;
  handle.setPointerCapture(event.pointerId);
}

function move(event: PointerEvent): void {
  if (!dragging.value || !panel) return;
  offset.value = { x: event.clientX - startX, y: event.clientY - startY };
  panel.style.translate = \`\${offset.value.x}px \${offset.value.y}px\`;
}

function end(event: PointerEvent): void {
  if (!dragging.value) return;
  dragging.value = false;
  panel = null;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}

// 每次重新展开都是一块新面板，位移从零算起
function reset(details: { open: boolean }): void {
  if (details.open) offset.value = { x: 0, y: 0 };
}
<\/script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }" @open-change="reset">
    <XhDialogTrigger>打开可拖动的对话框</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle
        style="cursor: move; touch-action: none"
        @pointerdown="begin"
        @pointermove="move"
        @pointerup="end"
        @pointercancel="end"
      >
        拖住这一行挪窗口
      </XhDialogTitle>
      <XhDialogDescription>
        位移是相对居中位置累计的，收起再打开会回到正中。
      </XhDialogDescription>
      <p style="margin: 0; color: var(--xh-fg-muted)">
        当前位移：{{ Math.round(offset.x) }} / {{ Math.round(offset.y) }}
      </p>
      <div style="display: flex; justify-content: flex-end">
        <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
      </div>
      <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
    </XhDialogContent>
  </XhDialogRoot>
</template>
`;export{n as default};
