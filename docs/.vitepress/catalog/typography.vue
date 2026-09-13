<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 typography 相关实现。 -->

<script setup lang="ts">
import { XhTypographyHeading, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTypographyRoot style="max-inline-size: 190px">
    <XhTypographyHeading as="h3" :level="3">排印标题</XhTypographyHeading>
    <XhTypographyParagraph>统一正文的字号与行高。</XhTypographyParagraph>
  </XhTypographyRoot>
</template>
