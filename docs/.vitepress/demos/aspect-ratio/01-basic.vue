<!-- 基础用法 | ratio 写宽 ÷ 高：盒宽随容器，高由比例算出，里面的内容铺满整个盒子 -->
<script setup lang="ts">
import { XhAspectRatio } from "@xihan-ui/vue";
</script>

<template>
  <XhAspectRatio :ratio="16 / 9">
    <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: 100%" />
  </XhAspectRatio>
</template>
