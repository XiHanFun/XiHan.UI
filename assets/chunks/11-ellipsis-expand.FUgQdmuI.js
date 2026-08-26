const n=`<!-- 摊开省略号 | 折进去的那几页悬停即摊开，点一下也摊开——纯悬停会把键盘用户挡在外面，而这几页除了这里没有别的入口；Escape 或点外面收起 -->
<script setup lang="ts">
import {
  XhPaginationContent,
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPositioner,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ pageItems, page }"
    :count="2000"
    :page-size="10"
    :default-page="100"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(item, i) in pageItems" :key="\`\${item.type}-\${i}\`">
      <XhPaginationEllipsis v-if="item.type === 'ellipsis'" :side="item.side" />
      <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <XhPaginationPositioner>
      <XhPaginationContent v-slot="{ pages }">
        <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
      </XhPaginationContent>
    </XhPaginationPositioner>

    <span style="flex-basis: 100%">当前第 {{ page }} 页，共 200 页</span>
  </XhPaginationRoot>
</template>
`;export{n as default};
