<!-- 多选 | 选择多个值 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>(["apple"]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :collection="fruits"
    multiple
    label="水果（多选）"
    placeholder="请选择"
  />
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
