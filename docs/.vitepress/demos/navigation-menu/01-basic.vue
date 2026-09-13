<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 从顶部入口展开站点导航 -->
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "resources", label: "资源" },
];
const panels: Record<string, Array<{ href: string; title: string; description: string }>> = {
  products: [
    { href: "#/products/headless", title: "无头内核", description: "框架无关的行为与状态" },
    { href: "#/products/adapters", title: "多端适配器", description: "Vue、React 与 Web Components" },
  ],
  docs: [
    { href: "#/docs/guide", title: "快速开始", description: "安装并创建第一个组件" },
    { href: "#/docs/components", title: "组件文档", description: "浏览组件与 API" },
  ],
  resources: [
    { href: "#/resources/themes", title: "主题", description: "令牌与视觉定制" },
    { href: "#/resources/examples", title: "示例", description: "常见界面组合" },
  ],
};
</script>

<template>
  <div style="inline-size: min(720px, 100%); padding-block-end: 180px">
    <XhNavigationMenuRoot :collection="entries">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="item in panels[node.value]"
          :key="item.href"
          :href="item.href"
          style="align-items: flex-start"
        >
          <span style="display: grid; gap: 2px">
            <strong>{{ item.title }}</strong>
            <span style="color: var(--xh-fg-muted)">{{ item.description }}</span>
          </span>
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
