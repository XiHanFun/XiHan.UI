<!-- 整组禁用 | 分页自己没有禁用开关：裹一层 disabled 的 fieldset，里面的按钮统一失效并脱出 Tab 序 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const loading = ref(true);

// 禁用期间把页码格子的取色也压成禁用态：上一页 / 下一页由皮肤的 :disabled 规则自己接管
const mutedTokens = {
  "--xh-pagination-item-fg": "var(--xh-fg-disabled)",
  "--xh-pagination-item-bg-hover": "transparent",
  "--xh-pagination-item-bg-selected": "var(--xh-bg-muted)",
  "--xh-pagination-item-border-selected": "var(--xh-bg-muted)",
  "--xh-pagination-item-fg-selected": "var(--xh-fg-disabled)",
};
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton size="sm" variant="outline" @click="loading = !loading">
        {{ loading ? "加载完成" : "重新加载" }}
      </XhButton>
      <span>{{ loading ? "数据加载中，整组分页不可操作" : "可以翻页了" }}</span>
    </div>

    <fieldset
      :disabled="loading"
      :style="[
        { margin: 0, padding: 0, border: 0, minInlineSize: 0 },
        loading ? mutedTokens : {},
      ]"
    >
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="196"
        :page-size="10"
        :default-page="3"
      >
        <XhPaginationPrevTrigger>上一页</XhPaginationPrevTrigger>
        <template v-for="(p, i) in pages" :key="`${p}-${i}`">
          <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
          <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
        </template>
        <XhPaginationNextTrigger>下一页</XhPaginationNextTrigger>
      </XhPaginationRoot>
    </fieldset>
  </div>
</template>
