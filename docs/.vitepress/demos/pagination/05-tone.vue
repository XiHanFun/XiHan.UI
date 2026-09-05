<!-- 语气 | tone 换的是当前页选中态的底色与文字色，这里预置第 3 页为当前页 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "brand（缺省）" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
];
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div
      v-for="t in tones"
      :key="t.value"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 120px; flex: none">{{ t.label }}</span>
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="50"
        :page-size="10"
        :default-page="3"
        :tone="t.value"
      >
        <XhPaginationPrevTrigger />
        <template v-for="(p, i) in pages" :key="`${p}-${i}`">
          <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'">…</XhPaginationEllipsisTrigger>
          <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
        </template>
        <XhPaginationNextTrigger />
      </XhPaginationRoot>
    </div>
  </div>
</template>
