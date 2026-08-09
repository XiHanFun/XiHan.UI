<!-- 关掉爬升 | trickle 为 false 时条子停在起步值 minimum 不动，往前走全靠宿主收尾 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";

const loading = ref(false);
</script>

<template>
  <XhLoadingBarRoot
    :loading="loading"
    :trickle="false"
    :minimum="30"
    :height="6"
  >
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="loading = true">开始加载</XhButton>
  <XhButton variant="outline" @click="loading = false">结束加载</XhButton>
  <span>开始后停在 30%，按「结束加载」才冲到 100 并淡出</span>
</template>
