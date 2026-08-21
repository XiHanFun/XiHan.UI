const e=`<!-- 按版面占位 | 骨架条的宽高由内联样式与组件令牌定，占位形状贴着真内容将来的样子 -->
<script setup lang="ts">
import { XhSkeletonBone, XhSkeletonRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <!-- 卡片位：一块封面加两行正文，末行收窄，看起来像一段还没排出来的字 -->
  <XhSkeletonRoot style="inline-size: 240px">
    <XhSkeletonBone
      variant="rect"
      style="--xh-skeleton-rect-block-size: 120px"
    />
    <XhSkeletonBone />
    <XhSkeletonBone style="inline-size: 60%" />
  </XhSkeletonRoot>

  <!-- 控件位：圆点直径与两个按钮的宽高各自定死，加载结束后位置不会跳 -->
  <XhSkeletonRoot
    style="inline-size: 240px; flex-direction: row; align-items: center"
  >
    <XhSkeletonBone
      variant="circle"
      style="--xh-skeleton-circle-size: 28px"
    />
    <XhSkeletonBone
      variant="rect"
      style="inline-size: 96px; --xh-skeleton-rect-block-size: 32px"
    />
    <XhSkeletonBone
      variant="rect"
      style="inline-size: 64px; --xh-skeleton-rect-block-size: 32px"
    />
  </XhSkeletonRoot>
</template>
`;export{e as default};
