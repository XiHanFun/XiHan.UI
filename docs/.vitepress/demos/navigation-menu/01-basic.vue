<!-- 基础用法 | 面板写在同一个 li 里、紧跟 trigger 之后，展开时按 Tab 就走得进去；里面的条目是链接不是命令，点了就跳走 -->
<script setup lang="ts">
import {
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "products",
    label: "产品",
    links: [
      { href: "#/products/runtime", label: "运行时内核" },
      { href: "#/products/vue", label: "Vue 适配器" },
      { href: "#/products/wc", label: "Web Components 适配器" },
    ],
  },
  {
    value: "docs",
    label: "文档",
    links: [
      { href: "#/docs/guide", label: "上手指南" },
      { href: "#/docs/anatomy", label: "部件解剖" },
    ],
  },
  {
    value: "about",
    label: "关于",
    links: [{ href: "#/about/team", label: "团队" }],
  },
];

// 指向当前页面的那一条：拿它比对即可
const currentHref = "#/docs/guide";
</script>

<template>
  <!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
  <div style="inline-size: 100%; padding-block-end: 180px">
    <XhNavigationMenuRoot>
      <XhNavigationMenuList>
        <XhNavigationMenuItem v-for="g in groups" :key="g.value">
          <XhNavigationMenuTrigger :value="g.value">
            {{ g.label }}
          </XhNavigationMenuTrigger>
          <XhNavigationMenuContent :value="g.value">
            <XhNavigationMenuLink
              v-for="l in g.links"
              :key="l.href"
              :href="l.href"
              :current="l.href === currentHref"
            >
              {{ l.label }}
            </XhNavigationMenuLink>
          </XhNavigationMenuContent>
        </XhNavigationMenuItem>
        <!-- 指示条必须住在 list 里：它以 list 为定位参照系，而 ul 里只放得下 li -->
        <XhNavigationMenuIndicator />
      </XhNavigationMenuList>
    </XhNavigationMenuRoot>
  </div>
</template>
