<!-- 允许全收 | 单开模式下最后一项默认收不起来，加 collapsible 才能把它也收上 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['one']" collapsible>
      <XhAccordionItem value="one">
        <XhAccordionHeader>
          <XhAccordionTrigger>再点一次就收起</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>点当前展开项的标题，它会收起，展开集合变成空数组。</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="two">
        <XhAccordionHeader>
          <XhAccordionTrigger>另一项</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>展开它会把上一项挤掉，单开模式一次只留一项。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
