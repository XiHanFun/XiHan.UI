const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 禁用与只读 | 禁用项不可操作，只读项仍可聚焦 -->
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
