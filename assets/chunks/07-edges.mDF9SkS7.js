var e=`<!-- 首页与末页 | 页数很多时一步跳到头 -->
<script setup lang="ts">
import {
  XhPaginationFirstTrigger,
  XhPaginationLastTrigger,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const page = ref(37);
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ page: current, totalPages }"
    v-model:page="page"
    :count="1000"
    :page-size="10"
  >
    <XhPaginationFirstTrigger />
    <XhPaginationPrevTrigger />
    <span>{{ current }} / {{ totalPages }}</span>
    <XhPaginationNextTrigger />
    <XhPaginationLastTrigger />
  </XhPaginationRoot>
</template>
`;export{e as default};