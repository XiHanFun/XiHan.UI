<!-- 悬停展开 | 触发器与浮层各挂一对进出事件，进出各自延时；两边的延时都由宿主的定时器管 -->
<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";

type SetOpen = (next: boolean) => void;

const OPEN_DELAY = 120;
const CLOSE_DELAY = 240;

const picked = ref("");
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function enter(setOpen: SetOpen): void {
  clearTimeout(closeTimer);
  openTimer = setTimeout(() => setOpen(true), OPEN_DELAY);
}

// 指针从触发器挪到浮层要跨过一段空隙，收起延时就是给这段路留的余量
function leave(setOpen: SetOpen): void {
  clearTimeout(openTimer);
  closeTimer = setTimeout(() => setOpen(false), CLOSE_DELAY);
}

function stay(): void {
  clearTimeout(closeTimer);
}

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}

onBeforeUnmount(() => {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
});
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenuRoot v-slot="{ setOpen }" placement="bottom-start" :offset="6" @select="onSelect">
      <XhMenuTrigger @pointerenter="enter(setOpen)" @pointerleave="leave(setOpen)">
        更多操作
      </XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent @pointerenter="stay" @pointerleave="leave(setOpen)">
          <XhMenuItem value="rename">重命名</XhMenuItem>
          <XhMenuItem value="duplicate">创建副本</XhMenuItem>
          <XhMenuSeparator />
          <XhMenuItem value="archive">归档</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
