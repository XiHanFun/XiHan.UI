<!-- 基础用法 | 焦点与选中是两条线：方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";

const city = ref<string[]>(["beijing"]);
const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];
</script>

<template>
  <XhListboxRoot v-slot="{ isSelected }" v-model:value="city" style="max-inline-size: 320px">
    <XhListboxLabel>城市</XhListboxLabel>
    <XhListboxContent>
      <XhListboxItem v-for="c in cities" :key="c.value" :value="c.value" :disabled="c.disabled">
        <XhListboxItemText>{{ c.label }}</XhListboxItemText>
        <XhListboxItemIndicator>{{ isSelected(c.value) ? "✓" : "" }}</XhListboxItemIndicator>
      </XhListboxItem>
    </XhListboxContent>
  </XhListboxRoot>
  <p>已选：{{ city.length ? city.join("、") : "（无）" }}</p>
</template>
