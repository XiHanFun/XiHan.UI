<script setup lang="ts">
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "resources", label: "资源" },
];
</script>

<template>
  <!-- 受控停在「产品」上：面板就地铺在条目下 -->
  <XhNavigationMenuRoot value="products" style="display: grid; justify-items: start; gap: 6px">
    <XhNavigationMenuList>
      <XhNavigationMenuItem v-for="entry in entries" :key="entry.value">
        <XhNavigationMenuTrigger :value="entry.value">{{ entry.label }}</XhNavigationMenuTrigger>
      </XhNavigationMenuItem>
    </XhNavigationMenuList>
    <XhNavigationMenuContent value="products" style="position: static; inline-size: 220px">
      <XhNavigationMenuLink href="#/products/headless" style="align-items: flex-start">
        <span style="display: grid; gap: 2px; font-size: 12px">
          <strong>无头内核</strong>
          <span style="color: var(--xh-fg-muted)">框架无关的行为与状态</span>
        </span>
      </XhNavigationMenuLink>
      <XhNavigationMenuLink href="#/products/adapters" style="align-items: flex-start">
        <span style="display: grid; gap: 2px; font-size: 12px">
          <strong>多端适配器</strong>
          <span style="color: var(--xh-fg-muted)">Vue、React 与 Web Components</span>
        </span>
      </XhNavigationMenuLink>
    </XhNavigationMenuContent>
  </XhNavigationMenuRoot>
</template>
