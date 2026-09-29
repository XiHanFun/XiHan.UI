const n=`<!-- 面板子级 | 面板里的条目再展开一层 -->
<script setup lang="ts">
import { XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  {
    value: "products",
    label: "产品",
    children: [
      { value: "overview", label: "产品概览", href: "#/products" },
      {
        value: "adapters",
        label: "框架适配器",
        children: [
          { value: "vue", label: "Vue", href: "#/products/vue" },
          { value: "react", label: "React", href: "#/products/react" },
          { value: "wc", label: "Web Components", href: "#/products/wc" },
        ],
      },
      {
        value: "tools",
        label: "开发工具",
        children: [
          { value: "cli", label: "命令行", href: "#/products/cli" },
          { value: "figma", label: "设计插件", href: "#/products/figma" },
        ],
      },
    ],
  },
  {
    value: "docs",
    label: "文档",
    children: [
      { value: "guide", label: "上手指南", href: "#/docs/guide" },
      { value: "components", label: "组件文档", href: "#/docs/components" },
    ],
  },
];
<\/script>

<template>
  <div style="inline-size: min(640px, 100%); padding-block-end: 260px">
    <XhNavigationMenuRoot :collection="entries" />
  </div>
</template>
`;export{n as default};
