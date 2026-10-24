<!-- 基础用法 | collection 是层级元信息的唯一事实源；不写结构时组件照它铺出标题与整棵树，缩进由子层容器自行撑开 -->
<script setup lang="ts">
import { XhTreeRoot } from "@xihan-ui/vue";

const collection = [
  {
    value: "src",
    label: "src",
    children: [
      {
        value: "components",
        label: "components",
        children: [
          { value: "button", label: "Button.vue" },
          { value: "dialog", label: "Dialog.vue" },
        ],
      },
      { value: "main", label: "main.ts" },
    ],
  },
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  { value: "readme", label: "README.md" },
];
</script>

<template>
  <XhTreeRoot
    :collection="collection"
    :default-expanded-value="['src']"
    label="项目文件"
    style="inline-size: 100%; max-inline-size: 320px"
  />
</template>
