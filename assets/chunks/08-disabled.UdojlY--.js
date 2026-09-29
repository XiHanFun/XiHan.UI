const n=`<!-- 整组禁用 | 数据加载期间整组不可操作，当前页仍标得出 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="196"
    :page-size="10"
    :default-page="3"
    disabled
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
`;export{n as default};
