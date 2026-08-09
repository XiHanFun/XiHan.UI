<!-- 厚度与颜色 | height 数字按像素、字符串按任意 CSS 长度；color 只改进度段的底色 -->
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
  <XhLoadingBarRoot :loading="loading" :height="6" color="#f97316">
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="loading = true">开始加载</XhButton>
  <XhButton variant="outline" @click="loading = false">结束加载</XhButton>
  <span>6px 厚的橙色条子，仍然贴在视口顶边</span>
</template>
