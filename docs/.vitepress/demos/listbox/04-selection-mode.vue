<!-- 选择模式 | selection-mode 直接指定三种模式，extended 是「单击换一条、Ctrl 与 Shift 才扩选」 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhListboxRoot } from "@xihan-ui/vue";

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
    v-model:value="files"
    :collection="options"
    label="文件（extended）"
    selection-mode="extended"
    style="max-inline-size: 320px"
  />
  <p>已选：{{ files.length ? files.join("、") : "（无）" }}</p>
</template>
