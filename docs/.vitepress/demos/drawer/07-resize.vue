<!-- 拖边缘改厚度 | 面板里放一根把手，拖动时把新厚度写进 content 的 --xh-drawer-size；这个槽压过 size 三档，滑入滑出仍按面板自身宽度算 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

const MIN = 260;
const MAX = 560;

const width = ref(0);
const dragging = ref(false);
let panel: HTMLElement | null = null;

function begin(event: PointerEvent): void {
  const handle = event.currentTarget as HTMLElement;
  panel = handle.closest<HTMLElement>('[data-scope="drawer"][data-part="content"]');
  if (!panel) return;
  dragging.value = true;
  // 起点取面板当前的实际厚度
  width.value = Math.round(panel.getBoundingClientRect().width);
  handle.setPointerCapture(event.pointerId);
}

function move(event: PointerEvent): void {
  if (!dragging.value || !panel) return;
  // 面板贴右边，厚度就是视口右缘到指针的距离
  width.value = Math.round(Math.min(MAX, Math.max(MIN, window.innerWidth - event.clientX)));
  panel.style.setProperty("--xh-drawer-size", `${width.value}px`);
}

function end(event: PointerEvent): void {
  if (!dragging.value) return;
  dragging.value = false;
  panel = null;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}
</script>

<template>
  <XhDrawerRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDrawerTrigger>打开可调宽的抽屉</XhDrawerTrigger>
    <XhDrawerContent>
      <div
        style="
          position: absolute;
          inset-block: 0;
          inset-inline-start: 0;
          inline-size: 8px;
          cursor: ew-resize;
          touch-action: none;
        "
        @pointerdown="begin"
        @pointermove="move"
        @pointerup="end"
        @pointercancel="end"
      />
      <XhDrawerTitle>字段设置</XhDrawerTitle>
      <XhDrawerDescription>
        拖面板左边缘，厚度在 {{ MIN }} 到 {{ MAX }} 像素之间取值。
      </XhDrawerDescription>
      <p style="margin: 0; color: var(--xh-fg-muted)">
        当前厚度：{{ width ? width + " px" : "默认" }}
      </p>
      <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
