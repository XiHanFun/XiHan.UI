<!-- 基础用法 | collection 是条目的事实源：显示文本与禁用都写在数据里，结构由组件铺开 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSelectRoot } from "@xihan-ui/vue";

const fruit = ref<string[]>([]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot v-model:value="fruit" :collection="fruits" label="水果" placeholder="请选择" />
  <p>当前值：{{ fruit.length ? fruit.join("、") : "（未选）" }}</p>
</template>
