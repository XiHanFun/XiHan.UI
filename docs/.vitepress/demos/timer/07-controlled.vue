<!-- 受控通道 | 给了 value 与 active 就走受控分支：value 改写即重新计时，active 翻假停在当前剩余量、翻真接着走 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton, XhTimerDisplay, XhTimerRoot } from "@xihan-ui/vue";

// 两个时长交替：value 变了组件才重新计时，同一个值再写一遍不算换了一轮
const rounds = [5000, 8000];
const at = ref(0);
const running = ref(true);
const done = ref(false);

function restart(): void {
  at.value = (at.value + 1) % rounds.length;
  done.value = false;
  running.value = true;
}
</script>

<template>
  <XhTimerRoot
    :value="rounds[at]"
    :active="running"
    :precision="1"
    format="s.S"
    @complete="done = true"
  >
    <template #default="{ text }">
      <XhTimerDisplay>{{ text }}</XhTimerDisplay>
    </template>
  </XhTimerRoot>
  <span> 秒</span>

  <XhButton variant="outline" @click="running = !running">
    {{ running ? "暂停" : "继续" }}
  </XhButton>
  <XhButton variant="solid" @click="restart">重新计时（5 秒 / 8 秒 交替）</XhButton>
  <span v-if="done">到点了</span>
</template>
