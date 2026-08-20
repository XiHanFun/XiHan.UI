<!-- 起停与归零 | 自己写部件：control 是一个原生按钮，按一下就按当前状态走一步（开始 / 暂停 / 继续 / 重来） -->
<script setup lang="ts">
import {
  XhTimerArea,
  XhTimerControl,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTimerRoot>
    <XhTimerArea>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerArea>
    <XhTimerControl>起停</XhTimerControl>
  </XhTimerRoot>
</template>
