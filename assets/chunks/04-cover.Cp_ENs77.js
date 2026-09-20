const r=`<!-- 带媒体 | 图片或自绘媒体作为普通子节点放入，由内容自己决定比例与圆角 -->
<script setup lang="ts">
import { XhCardContent, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
<\/script>

<template>
  <XhCardRoot variant="subtle" style="max-inline-size: 300px">
    <div
      aria-hidden="true"
      style="block-size: 120px; border-radius: var(--xh-shape-surface); background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-surface))"
    />
    <XhCardHeader>
      <XhCardTitle>七月总结</XhCardTitle>
      <XhCardDescription>媒体与文字共享卡片的统一节奏</XhCardDescription>
    </XhCardHeader>
    <XhCardContent>本月共完成 18 个里程碑。</XhCardContent>
  </XhCardRoot>
</template>
`;export{r as default};
