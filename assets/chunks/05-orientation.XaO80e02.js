const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 方向 | 水平或垂直排列 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
<\/script>

<template>
  <XhToggleGroupRoot :collection="options" default-value="day" />
  <XhToggleGroupRoot :collection="options" default-value="day" orientation="vertical" />
</template>
`;export{n as default};
