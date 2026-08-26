const n=`<!-- 两侧页数 | sibling-count 决定当前页两侧各留几页，序列长度恒定，切页时省略号左右挪、按钮不抖 -->
<script setup lang="ts">
import {
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="500"
    :page-size="10"
    :default-page="12"
    :sibling-count="2"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
      <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
`;export{n as default};
