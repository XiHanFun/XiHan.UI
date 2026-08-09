<!-- 只读与禁用 | read-only 仍进 Tab 序列、读屏念得出但改不动；disabled 整条退出 Tab 序列 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot v-slot="{ items }" :default-value="4" read-only>
      <XhRatingLabel>只读（4 星）</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="2" disabled>
      <XhRatingLabel>禁用（2 星）</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
