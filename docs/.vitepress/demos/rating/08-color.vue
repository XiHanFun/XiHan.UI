<!-- 自定义颜色 | 点亮色与未点亮色各是一个组件令牌，写在行内即可脱开语气档 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot
      v-slot="{ items }"
      :default-value="4"
      read-only
      style="--xh-rating-item-fg-highlighted: #4fb233"
    >
      <XhRatingLabel>只换点亮色</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot
      v-slot="{ items }"
      :default-value="2.5"
      allow-half
      style="--xh-rating-item-fg-highlighted: #e11d48; --xh-rating-item-fg: #fecdd3"
    >
      <XhRatingLabel>点亮与未点亮各给一色</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
