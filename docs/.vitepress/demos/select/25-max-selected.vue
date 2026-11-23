<!-- 限定多选数量 | max-selected=2：选满后其余选项不可再选，点掉一个即腾出名额 -->
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
    :max-selected="2"
    label="水果（最多两种）"
    placeholder="请选择"
  />
  <p data-demo-output>已选 {{ picked.length }} / 2：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
