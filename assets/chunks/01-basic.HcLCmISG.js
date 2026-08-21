const t=`<!-- 基础用法 | 根与条目的标签由使用者定，这里写成 ul 与 li；条目里只写用得上的那几个位 -->
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

const people = [
  { name: "张三", desc: "技术部 · 前端" },
  { name: "李四", desc: "技术部 · 后端" },
  { name: "王五", desc: "设计部 · 交互" },
];
<\/script>

<template>
  <XhListRoot style="max-inline-size: 360px">
    <XhListItem v-for="p in people" :key="p.name">
      <XhListItemContent>
        <XhListItemTitle>{{ p.name }}</XhListItemTitle>
        <XhListItemDescription>{{ p.desc }}</XhListItemDescription>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
`;export{t as default};
