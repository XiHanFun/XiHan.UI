<!-- 允许全收 | 单开模式下最后一项默认收不起来，加 collapsible 才能把它也收上 -->
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const items = [
  {
    value: "one",
    label: "再点一次就收起",
    content: "点当前展开项的标题，它会收起，展开集合变成空数组。",
  },
  {
    value: "two",
    label: "另一项",
    content: "展开它会把上一项挤掉，单开模式一次只留一项。",
  },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :collection="items" :default-value="['one']" collapsible />
  </div>
</template>
