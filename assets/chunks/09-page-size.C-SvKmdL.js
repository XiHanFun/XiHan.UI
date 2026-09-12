const n=`<!-- 每页条数 | 控制器就是库里的下拉：档位从 page-size-options 来、档位文字取 translations.pageSizeOption，换档时页码跟着换算，改档前第一条仍留在页内 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPageSizeSelect,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const translations = { pageSizeOption: (size: number) => \`\${size} 条 / 页\` };
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, pageRange, count, page }"
    :count="196"
    :default-page-size="10"
    :page-size-options="[10, 20, 50]"
    :default-page="8"
    :translations="translations"
    style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; inline-size: 100%"
  >
    <XhPaginationPageSizeSelect />

    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <span style="flex-basis: 100%">
      第 {{ page }} 页 · 第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条
    </span>
  </XhPaginationRoot>
</template>
`;export{n as default};
