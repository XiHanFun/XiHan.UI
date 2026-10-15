<!-- 每一拍与到期 | tick 每过一个 interval 触发一次，complete 只在到达终点时触发一次；到期的一拍不再触发 tick -->
<script setup lang="ts">
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

const ticks = ref(0);
const done = ref(false);
// 起停钮不写内容，组件照当前动作填 translations 里的那句，字与读屏名同一句
const translations = { start: "开始", pause: "暂停", resume: "继续", reset: "重置" };

// 按钮本身归组件管起停，这里只把计数一起归零
function restart(): void {
  ticks.value = 0;
  done.value = false;
}
</script>

<template>
  <XhTimerRoot
    countdown
    :start-ms="5000"
    :translations="translations"
    @tick="ticks++"
    @complete="done = true"
  >
    <XhTimerDisplay>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerDisplay>
    <XhTimerControl @click="restart" />
  </XhTimerRoot>

  <p>已经跳了 {{ ticks }} 拍{{ done ? "，到点了" : "" }}</p>
</template>
