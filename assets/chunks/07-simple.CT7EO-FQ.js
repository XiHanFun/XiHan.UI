const n=`<!-- 极简排布 | 页码序列不渲染也行，只留上一页 / 下一页与一行位置回显；先后顺序归作者 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const page = ref(2);
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ page: current, totalPages }"
    v-model:page="page"
    :count="1000"
    :page-size="10"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger>上一页</XhPaginationPrevTrigger>
    <span>{{ current }} / {{ totalPages }}</span>
    <XhPaginationNextTrigger>下一页</XhPaginationNextTrigger>
  </XhPaginationRoot>
</template>
`;export{n as default};
