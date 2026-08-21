const o=`<!-- 事件 | open-change 带一份 { open }，报的是这次要落到的状态；非受控时内部开合也照发一次 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const log = ref<string[]>([]);

// 只留最近五条
function onOpenChange(details: { open: boolean }) {
  log.value = [details.open ? "展开" : "收起", ...log.value].slice(0, 5);
}
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopoverRoot placement="bottom-start" @open-change="onOpenChange">
      <XhPopoverTrigger>点开再关掉</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverDescription>
            按钮、Escape、点浮层外部，三条路都会发一次意图。
          </XhPopoverDescription>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
    <span>最近：{{ log.join(" ← ") || "（还没动过）" }}</span>
  </div>
</template>
`;export{o as default};
