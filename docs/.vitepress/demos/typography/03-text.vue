<!-- 行内文字 | variant 换形态：muted 弱化、strong 加重、code 等宽 -->
<script setup lang="ts">
import {
  XhTypographyLink,
  XhTypographyParagraph,
  XhTypographyRoot,
  XhTypographyText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph>
      不写 variant 就是一段普通正文，<XhTypographyText variant="muted">这一段弱化</XhTypographyText>，
      <XhTypographyText variant="strong">这一段加重</XhTypographyText>，
      档位写在 <XhTypographyText as="code" variant="code">data-level</XhTypographyText> 上。
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      链接自带下划线，<XhTypographyLink href="#">不只靠颜色区分</XhTypographyLink>。
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
