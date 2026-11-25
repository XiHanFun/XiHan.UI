<!-- 基础用法 | 内容收进居中的版心：铺满所在的行，宽到最大宽度档就停下，左右留出内衬 -->
<script setup lang="ts">
import { XhContainer, XhFlex } from "@xihan-ui/vue";
</script>

<template>
  <!-- 虚线只为看清版心的边界：outline 不占盒，量出来的宽度与内衬与不画时一致 -->
  <XhContainer style="outline: var(--xh-stroke-thin) dashed var(--xh-border-default); outline-offset: calc(var(--xh-stroke-thin) * -1)">
    <XhFlex orientation="vertical" gap="sm">
      <span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 40%" />
      <span data-demo-block="line" data-tone="neutral" />
      <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 72%" />
    </XhFlex>
  </XhContainer>
</template>
