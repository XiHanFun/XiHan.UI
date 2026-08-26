const n=`<!-- 尺寸 | size 一档换掉页码格子的高度、内边距与字号，上一页 / 下一页与省略号一并跟着变 -->
<script setup lang="ts">
import {
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 16px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 60px; flex: none">{{ s.label }}</span>
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="200"
        :page-size="10"
        :default-page="4"
        :size="s.value"
      >
        <XhPaginationPrevTrigger />
        <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
          <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
          <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
        </template>
        <XhPaginationNextTrigger />
      </XhPaginationRoot>
    </div>
  </div>
</template>
`;export{n as default};
