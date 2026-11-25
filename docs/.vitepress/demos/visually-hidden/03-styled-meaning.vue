<!-- 补全样式里的意思 | 删除线只给眼睛看，读屏只会连读两个数字；把「原价」「现价」写成藏起来的文字 -->
<script setup lang="ts">
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText, XhVisuallyHidden } from "@xihan-ui/vue";
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph>
      <XhTypographyText as="del" variant="muted" strikethrough><XhVisuallyHidden>原价</XhVisuallyHidden>¥199</XhTypographyText>
      <XhTypographyText weight="semibold" tone="danger"><XhVisuallyHidden>现价</XhVisuallyHidden>¥129</XhTypographyText>
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
