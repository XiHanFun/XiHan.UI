const n=`<!-- 共享面板 | 在固定位置切换不同导航内容 -->
<script setup lang="ts">
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuViewport,
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
    links: [{ href: "#/docs/guide", label: "上手指南" }],
  },
  {
    value: "about",
    label: "关于",
    links: [
      { href: "#/about/team", label: "团队" },
      { href: "#/about/contact", label: "联系我们" },
    ],
  },
];
<\/script>

<template>
  <div style="inline-size: min(640px, 100%); padding-block-end: 180px">
    <XhNavigationMenuRoot>
      <XhNavigationMenuList>
        <XhNavigationMenuItem v-for="g in groups" :key="g.value">
          <XhNavigationMenuTrigger :value="g.value">
            {{ g.label }}
          </XhNavigationMenuTrigger>
        </XhNavigationMenuItem>
      </XhNavigationMenuList>

      <XhNavigationMenuViewport>
        <XhNavigationMenuContent
          v-for="g in groups"
          :key="g.value"
          :value="g.value"
        >
          <XhNavigationMenuLink
            v-for="l in g.links"
            :key="l.href"
            :href="l.href"
          >
            {{ l.label }}
          </XhNavigationMenuLink>
        </XhNavigationMenuContent>
      </XhNavigationMenuViewport>
    </XhNavigationMenuRoot>
  </div>
</template>
`;export{n as default};
