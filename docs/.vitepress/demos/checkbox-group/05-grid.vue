<!-- 栅格排布 | 组容器的行列只是缺省排布，行内把 display 改成 grid 就能摆成多列 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCheckboxGroupItem,
  XhCheckboxGroupItemControl,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/vue";

const picked = ref<string[]>(["beijing", "chengdu"]);
const cities = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangzhou", label: "广州" },
  { value: "shenzhen", label: "深圳" },
  { value: "chengdu", label: "成都" },
  { value: "hangzhou", label: "杭州" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    v-model:value="picked"
    style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 16px"
  >
    <XhCheckboxGroupLabel style="grid-column: 1 / -1">开通城市</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="c in cities" :key="c.value" :value="c.value">
      <XhCheckboxGroupItemControl />
      <XhCheckboxGroupItemText>{{ c.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
</template>
