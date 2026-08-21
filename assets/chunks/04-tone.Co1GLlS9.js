const a=`<!-- 语气 | tone 决定这一段行内文字用哪族颜色，与 variant 是两个轴，可以一起写 -->
<script setup lang="ts">
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
<\/script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph v-for="t in tones" :key="t">
      <XhTypographyText :tone="t">{{ t }} 语气的一段文字</XhTypographyText>
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      <XhTypographyText tone="danger" variant="strong">此操作不可撤销</XhTypographyText>
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
`;export{a as default};
