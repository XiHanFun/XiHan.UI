<!-- 跟着数据走 | 改 to 就从当前数字接着走向新终点，跑完停下之后再改也照样重新跑；active 翻假即停在当前值 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton, XhNumberAnimation } from "@xihan-ui/vue";

const readings = [3600, 8250, 4180, 12040];
const at = ref(0);
const running = ref(true);
const settled = ref<number | null>(null);

function next(): void {
  at.value = (at.value + 1) % readings.length;
}
</script>

<template>
  <XhNumberAnimation
    :to="readings[at]"
    :duration="1200"
    :active="running"
    easing="easeOut"
    separator=","
    size="lg"
    @complete="settled = $event.value"
  />

  <XhButton variant="solid" @click="next">换一组读数</XhButton>
  <XhButton variant="outline" @click="running = !running">
    {{ running ? "暂停" : "继续" }}
  </XhButton>
  <span v-if="settled !== null">上一次停在：{{ settled }}</span>
</template>
