const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 快速跳页 | 输入页码后按 Enter 跳转 -->
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationJumper,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhPaginationRoot v-slot="{ pages }" :count="1000" :page-size="10" :default-page="5">
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="\`\${p}-\${i}\`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
    <XhPaginationJumper placeholder="页码" />
  </XhPaginationRoot>
</template>
`;export{n as default};
