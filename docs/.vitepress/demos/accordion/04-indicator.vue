<!-- 指示器与禁用 | indicator 的朝向由 data-state 驱动，禁用项点不动、方向键也跳过它 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['ready']">
      <XhAccordionItem value="ready">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>已发布</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>标题右侧那个箭头就是 indicator，展开时自动翻转。</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="draft" disabled>
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>草稿（禁用）</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>这一项展不开。</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="archived">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>已归档</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>从第一项按方向键，会直接跳到这里。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
