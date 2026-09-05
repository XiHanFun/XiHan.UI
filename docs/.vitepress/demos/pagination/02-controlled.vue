<!-- 受控与切片 | 传了 page 就由宿主说了算；当前页决定从整份数据里切出哪一段 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const rows = Array.from({ length: 23 }, (_, i) => `第 ${i + 1} 条记录`);
const page = ref(1);
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, pageRange, count, slice }"
    v-model:page="page"
    :count="rows.length"
    :page-size="5"
    style="inline-size: 100%"
  >
    <ul style="flex-basis: 100%; margin: 0 0 4px; padding-inline-start: 20px">
      <li v-for="row in slice(rows)" :key="row">{{ row }}</li>
    </ul>

    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'">…</XhPaginationEllipsisTrigger>
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
    <span style="flex-basis: 100%">
      第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条
    </span>
  </XhPaginationRoot>
</template>
