const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 尺寸 | 提供三种尺寸 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
<\/script>

<template>
  <XhToggleGroupRoot :collection="options" default-value="day" size="sm" />
  <XhToggleGroupRoot :collection="options" default-value="week" />
  <XhToggleGroupRoot :collection="options" default-value="month" size="lg" />
</template>
`;export{e as default};
