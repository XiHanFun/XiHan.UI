const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 禁用 | 禁止展开和聚焦 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];
<\/script>

<template>
  <XhSelectRoot
    :collection="fruits"
    :default-value="['apple']"
    disabled
    label="水果"
    placeholder="请选择"
  />
</template>
`;export{n as default};
