<!-- 基础用法 | 单选 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot :collection="fruits" :default-value="['banana']" label="水果" placeholder="请选择" />
</template>
