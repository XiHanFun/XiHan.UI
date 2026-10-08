var e=`<!-- 分页 | 列表只画当前页的条目，末尾接分页：换页时换一段数据，条目与页码各管各的 -->
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

// 23 张工单，每页 5 张
const STATUS = ["待处理", "处理中", "已解决"];
const tickets = Array.from({ length: 23 }, (_, i) => ({
  id: 1001 + i,
  title: \`工单 #\${1001 + i}\`,
  desc: \`\${STATUS[i % 3]} · 华东区\`,
}));
const PAGE_SIZE = 5;

const page = ref(1);
const visible = computed(() => tickets.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); max-inline-size: 360px">
    <XhListRoot split>
      <XhListItem v-for="t in visible" :key="t.id">
        <XhListItemContent>
          <XhListItemTitle>{{ t.title }}</XhListItemTitle>
          <XhListItemDescription>{{ t.desc }}</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
    </XhListRoot>
    <XhPaginationRoot
      v-slot="{ pages }"
      v-model:page="page"
      :count="tickets.length"
      :page-size="PAGE_SIZE"
    >
      <XhPaginationPrevTrigger />
      <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
        <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
        <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
      </template>
      <XhPaginationNextTrigger />
    </XhPaginationRoot>
  </div>
</template>
`;export{e as default};