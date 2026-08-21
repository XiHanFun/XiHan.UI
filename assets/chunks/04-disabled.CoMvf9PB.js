const e=`<!-- 禁用与只读 | 整组禁用连隐藏输入一起退出提交，只读则仍能聚焦与朗读、只是改不动 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 单项禁用写在数据里，条目部件上不必再声明一遍
const partly = [
  { value: "cheese", label: "芝士" },
  { value: "truffle", label: "松露", disabled: true },
];
<\/script>

<template>
  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组禁用" disabled />

  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组只读" read-only />

  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="partly" label="单项禁用" />
</template>
`;export{e as default};
