const n=`<!-- 暂停、继续与到点 | active 翻假即停在当前剩余量，翻真从那里接着走；改 value 就是重新计时，到点派一次 finish -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton, XhCountdown } from "@xihan-ui/vue";

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
<\/script>

<template>
  <XhCountdown
    :value="rounds[at]"
    :active="running"
    :precision="1"
    format="s.S"
    @finish="done = true"
  />
  <span> 秒</span>

  <XhButton variant="outline" @click="running = !running">
    {{ running ? "暂停" : "继续" }}
  </XhButton>
  <XhButton variant="solid" @click="restart">重新计时（5 秒 / 8 秒 交替）</XhButton>
  <span v-if="done">到点了</span>
</template>
`;export{n as default};
