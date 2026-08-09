<!-- 多项展开 | multiple 允许多项并存，展开集合恒为 string[]，用 v-model:value 拿到它 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const panels = ref<string[]>(["basic", "size"]);
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhAccordionRoot v-model:value="panels" multiple>
      <XhAccordionItem value="basic">
        <XhAccordionHeader>
          <XhAccordionTrigger>基础属性</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>value、defaultValue、multiple。</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="size">
        <XhAccordionHeader>
          <XhAccordionTrigger>排版</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          orientation 决定方向键走哪条轴，默认 vertical。
        </XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="events">
        <XhAccordionHeader>
          <XhAccordionTrigger>事件</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          value-change 携带 { value }，update:value 携带裸数组。
        </XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
    <span>展开：{{ panels.length ? panels.join("、") : "（无）" }}</span>
  </div>
</template>
