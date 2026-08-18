<!-- 多项展开 | multiple 允许多项并存，展开集合恒为 string[]，受控绑定即可拿到它 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhAccordionRoot } from "@xihan-ui/vue";

const items = [
  { value: "basic", label: "基础属性", content: "value、defaultValue、multiple。" },
  {
    value: "size",
    label: "排版",
    content: "orientation 决定方向键走哪条轴，默认 vertical。",
  },
  {
    value: "events",
    label: "事件",
    content: "value-change 携带 { value }，update:value 携带裸数组。",
  },
];

const panels = ref<string[]>(["basic", "size"]);
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhAccordionRoot v-model:value="panels" :collection="items" multiple />
    <span>展开：{{ panels.length ? panels.join("、") : "（无）" }}</span>
  </div>
</template>
