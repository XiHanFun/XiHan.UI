<!-- 渐变字 | 为标题里的关键词铺品牌渐变；tone 换成语气色板，覆盖槽改写两端颜色与走向 -->
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyRoot, XhTypographyText } from "@xihan-ui/vue";

const tones = [
  { tone: "success", label: "成功" },
  { tone: "warning", label: "警告" },
  { tone: "danger", label: "危险" },
  { tone: "info", label: "信息" },
] as const;
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyHeading as="h2" :level="1">
      快速、轻量的<XhTypographyText variant="gradient">Headless 组件库</XhTypographyText>
    </XhTypographyHeading>
    <XhTypographyHeading :level="3">
      <template v-for="(item, index) in tones" :key="item.tone">
        <template v-if="index > 0">
          ·
        </template>
        <XhTypographyText variant="gradient" :tone="item.tone">
          {{ item.label }}
        </XhTypographyText>
      </template>
    </XhTypographyHeading>
    <XhTypographyHeading :level="3">
      <XhTypographyText
        variant="gradient"
        style="--xh-typography-gradient-from: var(--xh-color-orange-500); --xh-typography-gradient-to: var(--xh-color-pink-500)"
      >
        日落橙
      </XhTypographyText>
      ·
      <XhTypographyText
        variant="gradient"
        style="--xh-typography-gradient-from: var(--xh-color-purple-500); --xh-typography-gradient-to: var(--xh-color-cyan-500); --xh-typography-gradient-direction: to bottom right"
      >
        极光紫
      </XhTypographyText>
    </XhTypographyHeading>
  </XhTypographyRoot>
</template>
