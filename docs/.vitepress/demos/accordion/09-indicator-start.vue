<!-- 指示器在前 | 指示器写在标题之前就落到起始缘，标题拿 auto 外边距吃掉余量 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "one", label: "第一章", body: "指示器在标题左边，展开时照样翻转。" },
  { value: "two", label: "第二章", body: "部件的先后顺序就是它们在标题栏里的顺序。" },
  { value: "three", label: "第三章", body: "标题吃掉余量，右侧留白。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['one']">
      <XhAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <XhAccordionIndicator />
            <span style="margin-inline-end: auto">{{ item.label }}</span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ item.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
