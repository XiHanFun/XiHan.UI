<!-- 基础用法 | 值是字符串数组，各选各的，再点一次即取消；组内有几项就有几个 Tab 停靠点 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCheckboxGroupItem,
  XhCheckboxGroupItemControl,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/vue";

const toppings = ref<string[]>(["cheese"]);
const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
  { value: "corn", label: "玉米" },
];
</script>

<template>
  <XhCheckboxGroupRoot v-model:value="toppings" name="topping">
    <XhCheckboxGroupLabel>配料</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="t in items" :key="t.value" :value="t.value">
      <XhCheckboxGroupItemControl />
      <XhCheckboxGroupItemText>{{ t.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
  <span>当前：{{ toppings.join("、") || "（无）" }}</span>
</template>
