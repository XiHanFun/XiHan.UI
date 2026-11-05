<!-- 指示器在后 | 缺省的箭头排在标题之前；指示器写在标题之后即落到行尾 -->
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
  { value: "one", label: "第一章", body: "指示器在行尾，展开时照样转向。" },
  { value: "two", label: "第二章", body: "部件的先后顺序就是它们在标题栏里的顺序。" },
  { value: "three", label: "第三章", body: "余量落在标题与指示器之间。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['one']">
      <XhAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>{{ item.label }}</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ item.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
