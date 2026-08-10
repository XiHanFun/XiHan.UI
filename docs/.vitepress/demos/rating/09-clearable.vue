<!-- 再点一次清空 | 点中当前那一档就清回“还没评”，靠指针按下时的快照与本次落点比对 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";

const score = ref(3);
// 条目内部的点击会先把评分改掉，旧值得在指针按下那一刻先记住
const before = ref(0);

function clearIfSame(index: number) {
  if (before.value === index) score.value = 0;
}
</script>

<template>
  <XhRatingRoot v-slot="{ items }" v-model:value="score">
    <XhRatingLabel>整体满意度</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem
        v-for="i in items"
        :key="i"
        :value="i"
        @pointerdown="before = score"
        @click="clearIfSame(i)"
      >★</XhRatingItem>
    </XhRatingControl>
  </XhRatingRoot>
  <p>当前：{{ score === 0 ? "还没评" : score }}</p>
  <button type="button" @click="score = 0">清空</button>
</template>
