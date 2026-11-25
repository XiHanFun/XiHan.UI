<!-- 形态、语气与尺寸 | variant 设置正文、辅助、强调与代码样式，链接另用 link 部件；tone 使用语义颜色；size 设置正文大小 -->
<script setup lang="ts">
import {
  XhTypographyLink,
  XhTypographyParagraph,
  XhTypographyRoot,
  XhTypographyText,
} from "@xihan-ui/vue";

const tones = [
  { tone: "brand", label: "品牌" },
  { tone: "success", label: "成功" },
  { tone: "warning", label: "警告" },
  { tone: "danger", label: "危险" },
  { tone: "info", label: "信息" },
] as const;

const sizes = [
  { size: "sm", label: "小号正文" },
  { size: undefined, label: "默认正文" },
  { size: "lg", label: "大号正文" },
] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-8)">
    <XhTypographyRoot>
      <XhTypographyParagraph>默认正文</XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyText variant="muted">辅助信息</XhTypographyText></XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyText variant="strong">重要内容</XhTypographyText></XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyText as="code" variant="code">pnpm add @xihan-ui/vue</XhTypographyText></XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyLink href="#">查看文档</XhTypographyLink></XhTypographyParagraph>
    </XhTypographyRoot>

    <XhTypographyRoot>
      <XhTypographyParagraph v-for="item in tones" :key="item.tone">
        <XhTypographyText :tone="item.tone">{{ item.label }}</XhTypographyText>
      </XhTypographyParagraph>
    </XhTypographyRoot>

    <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
      <XhTypographyRoot v-for="s in sizes" :key="s.label" :size="s.size">
        <XhTypographyParagraph>{{ s.label }}</XhTypographyParagraph>
      </XhTypographyRoot>
    </div>
  </div>
</template>
