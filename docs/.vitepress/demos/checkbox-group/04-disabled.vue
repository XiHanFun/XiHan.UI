<!-- 禁用与只读 | 整组禁用连隐藏输入一起退出提交，只读则仍能聚焦与朗读、只是改不动 -->
<script setup lang="ts">
import {
  XhCheckboxGroupItem,
  XhCheckboxGroupItemControl,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];
</script>

<template>
  <XhCheckboxGroupRoot :default-value="['cheese']" disabled>
    <XhCheckboxGroupLabel>整组禁用</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="t in items" :key="t.value" :value="t.value">
      <XhCheckboxGroupItemControl />
      <XhCheckboxGroupItemText>{{ t.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>

  <XhCheckboxGroupRoot :default-value="['cheese']" read-only>
    <XhCheckboxGroupLabel>整组只读</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="t in items" :key="t.value" :value="t.value">
      <XhCheckboxGroupItemControl />
      <XhCheckboxGroupItemText>{{ t.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>

  <XhCheckboxGroupRoot :default-value="['cheese']">
    <XhCheckboxGroupLabel>单项禁用</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem value="cheese">
      <XhCheckboxGroupItemControl />
      <XhCheckboxGroupItemText>芝士</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
    <XhCheckboxGroupItem value="truffle" disabled>
      <XhCheckboxGroupItemControl />
      <XhCheckboxGroupItemText>松露</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
</template>
