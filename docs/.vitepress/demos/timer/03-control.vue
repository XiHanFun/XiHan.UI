<!-- 起停与归零 | 自己写部件：control 是一个原生按钮，按一下就按当前状态走一步（开始 / 暂停 / 继续 / 重来） -->
<script setup lang="ts">
import {
  XhTimerDisplay,
  XhTimerControl,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTimerRoot>
    <XhTimerDisplay>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerDisplay>
    <XhTimerControl>起停</XhTimerControl>
  </XhTimerRoot>
</template>
