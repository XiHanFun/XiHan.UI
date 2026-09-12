<!-- 基础用法 | 在页码之间导航 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="196"
    :page-size="10"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
