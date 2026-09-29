const a=`<!-- 删除线、下划线与标记 | 三个开关与形态、语气叠加；需要删除或标出的原生语义时把标签写成 del、mark -->
<script setup lang="ts">
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from "@xihan-ui/vue";
<\/script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph>
      现价 ¥129
      <XhTypographyText as="del" variant="muted" strikethrough>原价 ¥199</XhTypographyText>
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      提交前请<XhTypographyText underline>逐项核对</XhTypographyText>收货地址。
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      搜索结果中的<XhTypographyText as="mark" mark>关键词</XhTypographyText>会被标出，
      待确认的条目用<XhTypographyText as="mark" mark tone="warning">警告色标记</XhTypographyText>。
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
`;export{a as default};
