<!-- 自定义档数 | count 决定几颗星，插槽里的 items 就是 1..count 的序号表 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";

const level = ref(7);
</script>

<template>
  <XhRatingRoot v-slot="{ items }" v-model:value="level" :count="10">
    <XhRatingLabel>推荐指数（10 档）</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
    </XhRatingControl>
  </XhRatingRoot>
  <p>当前：{{ level }} / 10</p>
</template>
