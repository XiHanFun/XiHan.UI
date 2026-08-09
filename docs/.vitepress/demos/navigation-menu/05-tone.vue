<!-- 语气 | tone 换的是入口的高亮底与指示条、当前链接的文字色，静止态一样：悬停到入口上、或用方向键把焦点移过去才显现 -->
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

const tones = [
  { value: "brand", label: "brand" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
];
</script>

<template>
  <!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
  <div
    style="inline-size: 100%; display: flex; flex-wrap: wrap; gap: 8px; padding-block-end: 180px"
  >
    <XhNavigationMenuRoot v-for="t in tones" :key="t.value" :tone="t.value">
      <XhNavigationMenuList>
        <XhNavigationMenuItem>
          <XhNavigationMenuTrigger :value="t.value">
            {{ t.label }}
          </XhNavigationMenuTrigger>
          <XhNavigationMenuContent :value="t.value">
            <!-- 当前链接的文字色也吃这一档语气 -->
            <XhNavigationMenuLink href="#/docs/guide" current>
              上手指南
            </XhNavigationMenuLink>
            <XhNavigationMenuLink href="#/docs/anatomy">
              部件解剖
            </XhNavigationMenuLink>
          </XhNavigationMenuContent>
        </XhNavigationMenuItem>
        <XhNavigationMenuIndicator />
      </XhNavigationMenuList>
    </XhNavigationMenuRoot>
  </div>
</template>
