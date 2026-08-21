const r=`<!-- 带封面 | 封面顶到根的边上、不吃内边距，圆角由根统一裁 -->
<script setup lang="ts">
import { XhCardBody, XhCardCover, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
<\/script>

<template>
  <XhCardRoot variant="elevated" style="max-inline-size: 300px">
    <XhCardCover>
      <div
        style="
          block-size: 120px;
          background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle));
        "
      />
    </XhCardCover>
    <XhCardHeader>
      <XhCardTitle>七月总结</XhCardTitle>
      <XhCardDescription>封面是任意内容，放图片或自绘都行</XhCardDescription>
    </XhCardHeader>
    <XhCardBody>正文。</XhCardBody>
  </XhCardRoot>
</template>
`;export{r as default};
