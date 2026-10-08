var e=`<!-- 限定选择数 | min / max 约束选中数：选满时没选的项置灰，降到下限时已选的项摘不掉 -->
<script setup lang="ts">
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/vue";

const items = [
  { value: "design", label: "设计" },
  { value: "frontend", label: "前端" },
  { value: "backend", label: "后端" },
  { value: "data", label: "数据" },
];
<\/script>

<template>
  <XhCheckboxGroupRoot v-slot="{ value, atMax }" :default-value="['design']" :min="1" :max="2">
    <XhCheckboxGroupLabel>擅长方向（选 1 到 2 项）</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="item in items" :key="item.value" :value="item.value">
      <XhCheckboxGroupIndicator />
      <XhCheckboxGroupItemText>{{ item.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
    <span>已选 {{ value.length }} 项{{ atMax ? "，已达上限" : "" }}</span>
  </XhCheckboxGroupRoot>
</template>
`;export{e as default};