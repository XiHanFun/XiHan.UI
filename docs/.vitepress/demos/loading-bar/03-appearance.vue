<!-- 厚度 | height 数字按像素、字符串按任意 CSS 长度；进度段的颜色经语气或皮肤槽，不使用内联 -->
<script setup lang="ts">
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);
</script>

<template>
  <XhLoadingBarRoot :loading="loading" :height="6" tone="warning">
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="loading = true">开始加载</XhButton>
  <XhButton variant="outline" @click="loading = false">结束加载</XhButton>
  <span>6px 厚的警示色条子，仍然贴在视口顶边</span>
</template>
