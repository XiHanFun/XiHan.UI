const a=`<!-- 基础用法 | root 管段间距与最大行宽，标题与段落各自拿字号、字重、行高 -->
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhTypographyRoot>
    <!-- as 决定渲染成哪个标签，要进文档大纲就自己写上去 -->
    <XhTypographyHeading as="h3" :level="3">版式约定</XhTypographyHeading>
    <XhTypographyParagraph>
      字号、字重与行高都收进令牌，不再逐处手写。段与段之间的间距由 root 统一给。
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      最大行宽也由 root 管，整块正文不会拉成一行行难读的长句。
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
`;export{a as default};
