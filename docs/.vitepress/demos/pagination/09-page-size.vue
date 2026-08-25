<!-- 每页条数 | 档位住在分页里：default-page-size 非受控、page-size-options 给档位表；换档时页码跟着换算，改档前第一条仍留在页内 -->
<script setup lang="ts">
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
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, pageRange, count, page, pageSize, pageSizeOptions, setPageSize }"
    :count="196"
    :default-page-size="10"
    :page-size-options="[10, 20, 50]"
    :default-page="8"
    style="display: flex; flex-wrap: wrap; gap: 12px; inline-size: 100%"
  >
    <XhSelectRoot
      :value="[String(pageSize)]"
      size="sm"
      @value-change="(d) => setPageSize(Number(d.value[0]))"
    >
      <XhSelectLabel>每页条数</XhSelectLabel>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            <XhSelectItem v-for="o in pageSizeOptions" :key="o" :value="String(o)">
              <XhSelectItemText>{{ o }} 条 / 页</XhSelectItemText>
              <XhSelectItemIndicator />
            </XhSelectItem>
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>

    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <span style="flex-basis: 100%">
      第 {{ page }} 页 · 第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条
    </span>
  </XhPaginationRoot>
</template>
