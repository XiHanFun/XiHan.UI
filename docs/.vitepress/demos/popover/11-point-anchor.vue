<!-- 落在指针位置 | anchor 交一个只给得出矩形的虚拟锚点，浮层就固定在刚点击的位置；再点一次更换落点，不用再摆一颗看不见的触发器 -->
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
} from "@xihan-ui/vue";
import { ref, shallowRef } from "vue";

const open = ref(false);
const point = ref({ x: 0, y: 0 });
// 虚拟锚点：每次定位现读矩形；换一个对象，浮层即按新落点重挂
const anchor = shallowRef<{ getBoundingClientRect: () => DOMRect } | null>(null);

function pin(event: MouseEvent): void {
  const { clientX: x, clientY: y } = event;
  point.value = { x, y };
  anchor.value = { getBoundingClientRect: () => new DOMRect(x, y, 0, 0) };
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
        border: var(--xh-stroke-thin) dashed var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
        color: var(--xh-fg-muted);
        cursor: crosshair;
      "
      @click="pin"
    >
      在这块区域里点一下
    </div>

    <XhPopoverRoot
      v-model:open="open"
      :anchor="anchor"
      placement="bottom-start"
      :offset="8"
      :close-on-interact-outside="false"
      :translations="{ close: '关闭' }"
    >
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>这一点</XhPopoverTitle>
          <XhPopoverDescription>
            落点 {{ point.x }} / {{ point.y }}，按 Escape 收起。
          </XhPopoverDescription>
          <XhPopoverCloseTrigger />
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  </div>
</template>
