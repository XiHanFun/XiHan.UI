<!-- 多选 | multiple 下空格改成切换该条，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选 -->
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

const cities = ref<string[]>(["beijing", "london"]);
const options = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];
</script>

<template>
  <XhListboxRoot
    v-slot="{ isSelected }"
    v-model:value="cities"
    multiple
    style="max-inline-size: 320px"
  >
    <XhListboxLabel>常去城市</XhListboxLabel>
    <XhListboxContent>
      <XhListboxItem v-for="c in options" :key="c.value" :value="c.value">
        <XhListboxItemText>{{ c.label }}</XhListboxItemText>
        <XhListboxItemIndicator>{{ isSelected(c.value) ? "✓" : "" }}</XhListboxItemIndicator>
      </XhListboxItem>
    </XhListboxContent>
  </XhListboxRoot>
  <p>已选：{{ cities.length ? cities.join("、") : "（无）" }}</p>
</template>
