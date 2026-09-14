<!-- 直达链接 | 混合下拉入口与普通链接 -->
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "changelog", label: "更新日志", href: "#/changelog" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
  ],
  docs: [
    { href: "#/docs/guide", label: "上手指南" },
    { href: "#/docs/anatomy", label: "部件解剖" },
  ],
};
</script>

<template>
  <div style="inline-size: min(640px, 100%); padding-block-end: 150px">
    <XhNavigationMenuRoot :collection="entries">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
