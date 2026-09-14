<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhRatingRoot v-slot="{ items }" :default-value="3">
    <XhRatingLabel>整体满意度</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem v-for="i in items" :key="i" :value="i" />
    </XhRatingControl>
  </XhRatingRoot>
</template>
