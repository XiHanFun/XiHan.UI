<!-- 落在指针位置 | 触发器缩成一个像素、按点击坐标固定摆放，浮层就钉在刚点到的那一点上；再点一下换个落点 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
const point = ref({ x: 0, y: 0 });

// 指针坐标是物理坐标，锚点用 left / top 摆位；一像素而非零像素，位移探测才武装得起来
const anchorStyle = computed(
  () =>
    `position: fixed; left: ${point.value.x}px; top: ${point.value.y}px;`
    + " inline-size: 1px; block-size: 1px; padding: 0; border: 0; opacity: 0; pointer-events: none",
);

function pin(event: MouseEvent): void {
  point.value = { x: event.clientX, y: event.clientY };
  open.value = true;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div
      style="
        display: grid;
        place-items: center;
        block-size: 200px;
        border: 1px dashed var(--xh-border-default);
        border-radius: 8px;
        color: var(--xh-fg-muted);
        cursor: crosshair;
      "
      @click="pin"
    >
      在这块区域里点一下
    </div>

    <XhPopoverRoot
      v-model:open="open"
      placement="bottom-start"
      :offset="8"
      :close-on-interact-outside="false"
      :translations="{ close: '关闭' }"
    >
      <XhPopoverTrigger tabindex="-1" :style="anchorStyle" />
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>这一点</XhPopoverTitle>
          <XhPopoverDescription>
            落点 {{ point.x }} / {{ point.y }}，按 Escape 收起。
          </XhPopoverDescription>
          <XhPopoverCloseTrigger>✕</XhPopoverCloseTrigger>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  </div>
</template>
