<!-- 基础用法 | count 给的是总条数不是总页数；页码序列由 root 的插槽交出来，作者照着渲染 item 与省略号 -->
<script setup lang="ts">
import {
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, page, totalPages }"
    :count="196"
    :page-size="10"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
    <span style="flex-basis: 100%">第 {{ page }} / {{ totalPages }} 页</span>
  </XhPaginationRoot>
</template>
