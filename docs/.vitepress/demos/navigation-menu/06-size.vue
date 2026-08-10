<!-- 尺寸 | size 一档换掉入口的高度、内边距与字号，写在 root 上、面板里的链接一并跟着变 -->
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
  ],
  docs: [{ href: "#/docs/guide", label: "上手指南" }],
};
</script>

<template>
  <!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
  <div
    style="
      inline-size: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 24px;
      padding-block-end: 180px;
    "
  >
    <div v-for="s in sizes" :key="s.label" style="display: grid; gap: 6px">
      <span>{{ s.label }}</span>
      <XhNavigationMenuRoot :collection="entries" :size="s.value">
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
  </div>
</template>
