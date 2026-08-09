<!-- 选择模式 | selection-mode 直接指定三种模式，extended 是「单击换一条、Ctrl 与 Shift 才扩选」 -->
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

const files = ref<string[]>(["a"]);
const options = [
  { value: "a", label: "report.pdf" },
  { value: "b", label: "cover.png" },
  { value: "c", label: "notes.md" },
  { value: "d", label: "data.csv" },
];
</script>

<template>
  <XhListboxRoot
    v-slot="{ isSelected, selectionMode }"
    v-model:value="files"
    selection-mode="extended"
    style="max-inline-size: 320px"
  >
    <XhListboxLabel>文件（{{ selectionMode }}）</XhListboxLabel>
    <XhListboxContent>
      <XhListboxItem v-for="f in options" :key="f.value" :value="f.value">
        <XhListboxItemText>{{ f.label }}</XhListboxItemText>
        <XhListboxItemIndicator>{{ isSelected(f.value) ? "✓" : "" }}</XhListboxItemIndicator>
      </XhListboxItem>
    </XhListboxContent>
  </XhListboxRoot>
  <p>已选：{{ files.length ? files.join("、") : "（无）" }}</p>
</template>
