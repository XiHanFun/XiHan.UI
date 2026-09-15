const n=`<!-- 展开省略位 | 查看被折叠的页码 -->
<script setup lang="ts">
import {
  XhPaginationContent,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPositioner,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ pageItems }"
    :count="2000"
    :page-size="10"
    :default-page="100"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(item, i) in pageItems" :key="\`\${item.type}-\${i}\`">
      <XhPaginationEllipsisTrigger v-if="item.type === 'ellipsis'" :side="item.side" />
      <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <XhPaginationPositioner>
      <XhPaginationContent v-slot="{ pages }">
        <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
      </XhPaginationContent>
    </XhPaginationPositioner>
  </XhPaginationRoot>
</template>
`;export{n as default};
