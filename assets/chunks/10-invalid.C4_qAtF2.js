const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 校验状态 | 标记无效输入 -->
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
];
<\/script>

<template>
  <XhComboboxRoot
    :collection="cities"
    invalid
    label="常驻城市"
    open-on-click
    placeholder="请选择城市"
  />
</template>
`;export{n as default};
