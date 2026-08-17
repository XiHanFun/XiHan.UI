<!-- 局部抽屉 | container 给了容器就搬进去：遮罩与定位层从 fixed 换成 absolute，只罩住那块区域而不是盖满整屏 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

// 容器要自己带 position，否则 absolute 会往上找到别的定位祖先
const panel = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="panel"
    style="
      position: relative;
      overflow: hidden;
      block-size: 200px;
      padding: 16px;
      border: 1px solid var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
    "
  >
    <p style="margin: 0 0 12px">
      这块区域就是抽屉的容器：展开时遮罩只盖住它，页面其余部分照常可点。
    </p>

    <XhDrawerRoot :container="panel ?? undefined" side="right" size="sm">
      <XhDrawerTrigger>在这块区域里展开</XhDrawerTrigger>
      <XhDrawerContent>
        <XhDrawerTitle>局部抽屉</XhDrawerTitle>
        <XhDrawerDescription>
          它贴的是这个容器的右沿，不是视口的右沿。
        </XhDrawerDescription>
        <XhDrawerCloseTrigger>✕</XhDrawerCloseTrigger>
      </XhDrawerContent>
    </XhDrawerRoot>
  </div>

  <p style="font-size: 13px">
    不给 container 时问全局配置的 portalContainer，再没有才落 body——整屏抽屉与从前一模一样。
  </p>
</template>
