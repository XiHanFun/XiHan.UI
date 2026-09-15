<!-- 基础用法 | 水平排列内容 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";
</script>

<template>
  <XhFlex align="center" gap="sm" aria-label="水平排列占位区块">
    <span data-demo-block="square" data-tone="brand" />
    <XhFlex orientation="vertical" gap="xs">
      <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 96px" />
      <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 64px" />
    </XhFlex>
  </XhFlex>
</template>
