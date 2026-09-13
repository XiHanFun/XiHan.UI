const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 每页条数 | 调整每页展示数量 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPageSizeSelect,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPaginationSummary,
} from "@xihan-ui/vue";

const translations = {
  pageSizeOption: (size: number) => \`\${size} 条 / 页\`,
  summary: (start: number, end: number, total: number) => \`第 \${start}-\${end} 条，共 \${total} 条\`,
};
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="196"
    :default-page-size="10"
    :page-size-options="[10, 20, 50]"
    :default-page="8"
    :translations="translations"
  >
    <XhPaginationSummary />
    <XhPaginationPageSizeSelect />

    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
`;export{n as default};
