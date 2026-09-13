const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 受控状态 | 由外部状态控制选中值 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>("week");
const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
<\/script>

<template>
  <XhToggleGroupRoot v-model:value="value" :collection="options" disallow-empty />
</template>
`;export{n as default};
