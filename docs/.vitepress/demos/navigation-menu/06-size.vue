<!-- 尺寸 | size 一档换掉入口的高度、内边距与字号，写在 root 上、面板里的链接一并跟着变 -->
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

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];
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
      <XhNavigationMenuRoot :size="s.value">
        <XhNavigationMenuList>
          <XhNavigationMenuItem>
            <XhNavigationMenuTrigger value="products">产品</XhNavigationMenuTrigger>
            <XhNavigationMenuContent value="products">
              <XhNavigationMenuLink href="#/products/runtime">
                运行时内核
              </XhNavigationMenuLink>
              <XhNavigationMenuLink href="#/products/vue">
                Vue 适配器
              </XhNavigationMenuLink>
            </XhNavigationMenuContent>
          </XhNavigationMenuItem>
          <XhNavigationMenuItem>
            <XhNavigationMenuTrigger value="docs">文档</XhNavigationMenuTrigger>
            <XhNavigationMenuContent value="docs">
              <XhNavigationMenuLink href="#/docs/guide">
                上手指南
              </XhNavigationMenuLink>
            </XhNavigationMenuContent>
          </XhNavigationMenuItem>
          <XhNavigationMenuIndicator />
        </XhNavigationMenuList>
      </XhNavigationMenuRoot>
    </div>
  </div>
</template>
