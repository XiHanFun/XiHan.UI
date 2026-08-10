<!-- 每页条数 | pageSize 归宿主持有；换档后总页数重算，越界的当前页被夹回末页 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const options = ["10", "20", "50"];
const picked = ref<string[]>(["10"]);
const pageSize = computed(() => Number(picked.value[0] ?? "10"));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhSelectRoot v-model:value="picked" size="sm">
      <XhSelectLabel>每页条数</XhSelectLabel>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator>▾</XhSelectIndicator>
      </XhSelectTrigger>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectItem v-for="o in options" :key="o" :value="o">
            <XhSelectItemText>{{ o }} 条 / 页</XhSelectItemText>
            <XhSelectItemIndicator>✓</XhSelectItemIndicator>
          </XhSelectItem>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>

    <XhPaginationRoot
      v-slot="{ pages, pageRange, count }"
      :count="196"
      :page-size="pageSize"
      :default-page="8"
      style="inline-size: 100%"
    >
      <XhPaginationPrevTrigger>上一页</XhPaginationPrevTrigger>
      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
        <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
      </template>
      <XhPaginationNextTrigger>下一页</XhPaginationNextTrigger>
      <span style="flex-basis: 100%">
        第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条
      </span>
    </XhPaginationRoot>
  </div>
</template>
