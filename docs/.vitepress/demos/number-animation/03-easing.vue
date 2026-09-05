<!-- 缓动与时长 | duration 定跑多久，easing 定快慢怎么分配；同一段距离四档并排跑，差别一眼可见 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton, XhNumberAnimation } from "@xihan-ui/vue";

const easings = ["linear", "easeIn", "easeOut", "easeInOut"] as const;

// 终点在两个数之间来回换，每换一次四档都从当前数字重新走一遍
const to = ref(10000);

function toggle(): void {
  to.value = to.value === 10000 ? 0 : 10000;
}
</script>

<template>
  <p v-for="easing in easings" :key="easing">
    {{ easing }}：
    <XhNumberAnimation :to="to" :duration="2000" :easing="easing" separator="," />
  </p>
  <XhButton variant="outline" @click="toggle">换个终点再跑一遍</XhButton>
</template>
