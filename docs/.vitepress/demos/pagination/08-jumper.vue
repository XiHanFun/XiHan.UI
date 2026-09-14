<!-- 快速跳页 | 输入页码后按 Enter 跳转 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationJumper,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPaginationRoot v-slot="{ pages }" :count="1000" :page-size="10" :default-page="5">
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
    <XhPaginationJumper placeholder="页码" />
  </XhPaginationRoot>
</template>
