<!-- 基础用法 | 几个「阅读全文」链接各自补上藏起来的文章标题：屏幕上看着一样，读屏按链接列表浏览时分得清 -->
<script setup lang="ts">
import { XhTypographyLink, XhTypographyParagraph, XhTypographyRoot, XhVisuallyHidden } from "@xihan-ui/vue";
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph>
      设计令牌把颜色、间距与圆角收成一套语义名字。
      <XhTypographyLink href="#/">阅读全文<XhVisuallyHidden>：设计令牌入门</XhVisuallyHidden></XhTypographyLink>
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      组件的行为与皮肤分开交付，三端共用一份契约。
      <XhTypographyLink href="#/">阅读全文<XhVisuallyHidden>：三端共用一份契约</XhVisuallyHidden></XhTypographyLink>
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
