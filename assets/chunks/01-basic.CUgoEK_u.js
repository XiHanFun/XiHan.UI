const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 组合标题和正文 -->
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyLink, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhTypographyRoot>
    <XhTypographyHeading as="h3" :level="3">构建一致的产品体验</XhTypographyHeading>
    <XhTypographyParagraph>
      使用清晰的层级和舒适的行距组织内容。<XhTypographyLink href="#">阅读设计指南</XhTypographyLink>
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
`;export{n as default};
