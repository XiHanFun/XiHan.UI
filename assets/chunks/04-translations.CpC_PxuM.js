const n=`<!-- 读屏文案 | translations 换掉 nav 地标名与各按钮的 aria-label，默认是英文 -->
<script setup lang="ts">
import {
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const translations = {
  root: "订单列表分页",
  prevTrigger: "上一页",
  nextTrigger: "下一页",
  item: (page: number) => \`第 \${page} 页\`,
};
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="80"
    :page-size="10"
    :translations="translations"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger>上一页</XhPaginationPrevTrigger>
    <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
      <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger>下一页</XhPaginationNextTrigger>
  </XhPaginationRoot>
</template>
`;export{n as default};
