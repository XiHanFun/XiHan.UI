const n=`<!-- 基础用法 | 面板落在同一个 li 里、紧跟 trigger 之后，展开时按 Tab 就走得进去，里面的条目是链接不是命令，点了就跳走 -->
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "about", label: "关于" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
    { href: "#/products/wc", label: "Web Components 适配器" },
  ],
  docs: [
    { href: "#/docs/guide", label: "上手指南" },
    { href: "#/docs/anatomy", label: "部件解剖" },
  ],
  about: [{ href: "#/about/team", label: "团队" }],
};

// 指向当前页面的那一条：拿它比对即可
const currentHref = "#/docs/guide";
<\/script>

<template>
  <!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
  <div style="inline-size: 100%; padding-block-end: 180px">
    <XhNavigationMenuRoot :collection="entries">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
          :current="l.href === currentHref"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
`;export{n as default};
