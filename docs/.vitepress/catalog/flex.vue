<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";
</script>

<template>
  <XhFlex align="center" gap="sm" aria-label="横向与纵向弹性布局预览">
    <span data-demo-block="square" data-tone="brand" aria-hidden="true" />
    <XhFlex orientation="vertical" gap="xs" aria-hidden="true" style="inline-size: 96px">
      <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 88px" />
      <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 64px" />
    </XhFlex>
  </XhFlex>
</template>
