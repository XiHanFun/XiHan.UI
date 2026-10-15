<!-- 起停与归零 | 自行编写部件：control 是一个原生按钮，按一下即按当前状态前进一步（开始 / 暂停 / 继续 / 重置） -->
<script setup lang="ts">
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";

// 起停钮的读屏名随动作换；钮里不写内容时组件照当前动作填同一句，看到的字与读到的名字不会对不上
const translations = { start: "开始", pause: "暂停", resume: "继续", reset: "重置" };
</script>

<template>
  <XhTimerRoot :translations="translations">
    <XhTimerDisplay>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerDisplay>
    <XhTimerControl />
  </XhTimerRoot>
</template>
