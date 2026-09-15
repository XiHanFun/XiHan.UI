<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div aria-label="分隔两组内容的预览" style="inline-size: 220px">
    <div aria-hidden="true" style="display: grid; gap: 8px; padding-block: 8px">
      <span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 72%" />
      <span data-demo-block="line" data-tone="neutral" />
    </div>
    <XhSeparator />
    <div aria-hidden="true" style="display: grid; gap: 8px; padding-block: 8px">
      <span data-demo-block="line" data-tone="success" style="--xh-demo-block-inline-size: 64%" />
      <span data-demo-block="line" data-tone="info" />
    </div>
  </div>
</template>
