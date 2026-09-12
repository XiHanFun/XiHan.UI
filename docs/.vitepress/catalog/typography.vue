<script setup lang="ts">
import { XhTypographyHeading, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTypographyRoot style="max-inline-size: 190px">
    <XhTypographyHeading as="h3" :level="3">排印标题</XhTypographyHeading>
    <XhTypographyParagraph>统一正文的字号与行高。</XhTypographyParagraph>
  </XhTypographyRoot>
</template>
