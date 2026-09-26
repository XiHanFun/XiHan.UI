<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

const visits = [32, 36, 34, 40, 42, 39, 45, 47, 43, 50, 52, 55];
</script>

<template>
  <!-- 缺省尺寸是随文的一行字高，卡片里放大到卡片下发的宽，高取一格间距令牌 -->
  <XhSparkline
    :data="visits"
    aria-label="近 12 周访问量"
    style="--xh-sparkline-width: var(--xh-doc-catalog-w); --xh-sparkline-height: var(--xh-space-8)"
  />
</template>
