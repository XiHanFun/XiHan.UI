const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 颜色 | 使用语义颜色 -->
<script setup lang="ts">
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from "@xihan-ui/vue";

const tones = [
  { tone: "brand", label: "品牌" },
  { tone: "success", label: "成功" },
  { tone: "warning", label: "警告" },
  { tone: "danger", label: "危险" },
  { tone: "info", label: "信息" },
] as const;
<\/script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph v-for="item in tones" :key="item.tone">
      <XhTypographyText :tone="item.tone">{{ item.label }}</XhTypographyText>
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
`;export{n as default};
