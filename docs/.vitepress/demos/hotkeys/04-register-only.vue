<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 组合式函数 | 不渲染组件实例 -->
<script setup lang="ts">
import { useHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);

useHotkeys(() => ({
  keys: ["Mod", "K"],
  onHotKey: () => {
    count.value += 1;
  },
}));
</script>

<template>
  <output>按下 Mod + K · {{ count ? `已触发 ${count} 次` : "等待输入" }}</output>
</template>
