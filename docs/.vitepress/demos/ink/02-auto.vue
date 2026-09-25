<!-- 按底色选墨 | data-xh-ink="auto" 由 --xh-ink-surface 算相对亮度，浅底取黑墨、深底取白墨 -->
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";

const surfaces = ["var(--xh-color-orange-500)", "var(--xh-color-teal-300)", "var(--xh-color-purple-700)"];
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <section
      v-for="surface in surfaces"
      :key="surface"
      data-xh-ink="auto"
      :style="`--xh-ink-surface: ${surface}; background: ${surface}; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px; border-radius: var(--xh-shape-surface)`"
    >
      <XhButton>发布</XhButton>
      <XhButton variant="outline">取消</XhButton>
      <XhButton variant="ghost">稍后</XhButton>
    </section>
  </div>
</template>
