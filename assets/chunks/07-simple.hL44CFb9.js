const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 简洁模式 | 只显示上一页、当前页与下一页 -->
<script setup lang="ts">
import {
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const page = ref(2);
<\/script>

<template>
  <XhPaginationRoot
    v-slot="{ page: current, totalPages }"
    v-model:page="page"
    :count="1000"
    :page-size="10"
  >
    <XhPaginationPrevTrigger />
    <span>{{ current }} / {{ totalPages }}</span>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
`;export{n as default};
