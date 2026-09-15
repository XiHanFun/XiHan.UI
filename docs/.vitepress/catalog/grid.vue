<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cells = ["brand", "success", "info"] as const;
</script>

<template>
  <XhGridRoot :cols="3" gap="sm" aria-label="三列栅格预览" style="inline-size: 240px">
    <XhGridItem
      v-for="tone in cells"
      :key="tone"
      data-demo-block
      :data-tone="tone"
      aria-hidden="true"
      style="--xh-demo-block-block-size: 72px"
    />
  </XhGridRoot>
</template>
