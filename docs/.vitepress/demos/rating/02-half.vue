<!-- 半星与悬停预览 | allow-half 让落点分左右半边；划过只发 hover-change，评分要点下去才改 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";

const score = ref(2.5);
const preview = ref<number | null>(null);

function onHoverChange(details: { value: number | null }) {
  preview.value = details.value;
}
</script>

<template>
  <XhRatingRoot v-slot="{ items }" v-model:value="score" allow-half @hover-change="onHoverChange">
    <XhRatingLabel>服务评分</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
    </XhRatingControl>
  </XhRatingRoot>
  <p>评分：{{ score }} · 悬停预览：{{ preview ?? "（无）" }}</p>
</template>
