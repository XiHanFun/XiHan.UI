const n=`<!-- 每一拍与到点 | tick 每过一个 interval 发一次，complete 只在走到终点那一刻发一次；到点那一拍不再发 tick -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimerArea,
  XhTimerControl,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";

const ticks = ref(0);
const done = ref(false);

// 按钮本身归组件管起停，这里只把计数一起归零
function restart(): void {
  ticks.value = 0;
  done.value = false;
}
<\/script>

<template>
  <XhTimerRoot
    countdown
    :start-ms="5000"
    @tick="ticks++"
    @complete="done = true"
  >
    <XhTimerArea>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerArea>
    <XhTimerControl @click="restart">起停</XhTimerControl>
  </XhTimerRoot>

  <p>已经跳了 {{ ticks }} 拍{{ done ? "，到点了" : "" }}</p>
</template>
`;export{n as default};
