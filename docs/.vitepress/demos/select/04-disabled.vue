<!-- 禁用 | 根部件的 disabled 把触发器转成原生 disabled，浮层展不开、也不占 Tab 位 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];
</script>

<template>
  <XhSelectRoot
    :collection="fruits"
    :default-value="['apple']"
    disabled
    label="水果"
    placeholder="请选择"
  />
</template>
