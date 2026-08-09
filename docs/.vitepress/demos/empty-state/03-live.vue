<!-- 播报方式 | 缺省 polite 让 root 成为活区，筛完就地播报；off 让它只是个普通容器 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhEmptyStateDescription,
  XhEmptyStateIcon,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";

const keyword = ref("曦寒");
const hits = ref<string[]>([]);

function search(): void {
  // 演示用：偶数长度的关键词当作有结果
  hits.value = keyword.value.length % 2 === 0 ? ["一条命中的记录"] : [];
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <input v-model="keyword" type="search" aria-label="关键词" />
      <button type="button" @click="search">搜索</button>
    </div>

    <!-- 结果换成空的那一刻，读屏会在不打断当前朗读的前提下把标题念出来 -->
    <XhEmptyStateRoot v-if="!hits.length" live="polite">
      <XhEmptyStateIcon>∅</XhEmptyStateIcon>
      <XhEmptyStateTitle>没有匹配「{{ keyword }}」的结果</XhEmptyStateTitle>
      <XhEmptyStateDescription>换个词，或者去掉几个筛选条件。</XhEmptyStateDescription>
    </XhEmptyStateRoot>
    <p v-else style="margin: 0">{{ hits[0] }}</p>
  </div>
</template>
