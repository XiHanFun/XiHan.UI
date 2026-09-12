<!-- 尺寸 | 适配不同的界面密度 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "中" },
  { value: "lg", label: "大" },
];
</script>

<template>
  <div style="inline-size: min(720px, 100%); display: grid; gap: 16px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">{{ s.label }}</span>
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="200"
        :page-size="10"
        :default-page="4"
        :size="s.value"
      >
        <XhPaginationPrevTrigger />
        <template v-for="(p, i) in pages" :key="`${p}-${i}`">
          <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
          <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
        </template>
        <XhPaginationNextTrigger />
      </XhPaginationRoot>
    </div>
  </div>
</template>
