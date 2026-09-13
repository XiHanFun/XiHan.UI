<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 特殊键 | 常用修饰键、方向键与操作键由 Headless 统一格式化 -->
<script setup lang="ts">
import { XhKbd } from "@xihan-ui/vue";

const keys = ["Mod", "Shift", "ArrowUp", "Escape", "Enter"];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhKbd v-for="key in keys" :key="key" :value="key" />
  </div>
</template>
