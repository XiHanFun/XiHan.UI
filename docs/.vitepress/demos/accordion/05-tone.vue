<!-- 语气 | tone 落在展开态的标题上，六种语气各预置一项展开做对照 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
];
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    "
  >
    <XhAccordionRoot
      v-for="tone in tones"
      :key="tone.value"
      :tone="tone.value"
      :default-value="['open']"
    >
      <XhAccordionItem value="open">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>{{ tone.label }}（展开）</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>tone="{{ tone.value }}"</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="closed">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>{{ tone.label }}（收起）</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>收起态的标题不吃语气色。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
