<!-- 尺寸与状态 | size 适配不同的界面密度；disabled 让数据加载期间整组不可操作，当前页仍标得出 -->
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
  <div style="inline-size: min(720px, 100%); display: grid; gap: var(--xh-space-4)">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: var(--xh-space-3)"
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

    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">禁用</span>
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="196"
        :page-size="10"
        :default-page="3"
        disabled
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
