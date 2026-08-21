const t=`<!-- 基础用法 | 一组相关按钮连成一条：相邻两段共用一条边，圆角只留在两端 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const views = ["日", "周", "月"];
<\/script>

<template>
  <!-- 段就是组的直接子节点；形态写在组上，组内每段都取得到 -->
  <XhButtonGroup variant="outline">
    <XhButton v-for="v in views" :key="v">{{ v }}</XhButton>
  </XhButtonGroup>
</template>
`;export{t as default};
