<!-- 确定进度 | 传了 value 就由宿主说了算，宽度照它显示，内部爬升不再插手；loading 仍然负责露面与收起 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";

const loading = ref(false);
const value = ref(0);

function start(): void {
  value.value = 0;
  loading.value = true;
}

function advance(): void {
  value.value = Math.min(100, value.value + 25);
}
</script>

<template>
  <XhLoadingBarRoot :loading="loading" :value="value">
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="start">开始</XhButton>
  <XhButton variant="outline" @click="advance">推进 25%</XhButton>
  <XhButton variant="ghost" @click="loading = false">结束</XhButton>
  <span>进度：{{ value }}%</span>
</template>
