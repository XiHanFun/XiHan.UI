<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 启用状态 | 动态启用或暂停监听 -->
<script setup lang="ts">
import { XhHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const enabled = ref(true);
const count = ref(0);
</script>

<template>
  <label style="display: flex; align-items: center; gap: 8px">
    <input v-model="enabled" type="checkbox">
    启用 Mod + B
  </label>
  <XhHotkeys :keys="['Mod', 'B']" :enabled="enabled" @hot-key="count += 1" />
  <output>{{ count ? `已触发 ${count} 次` : "等待输入" }}</output>
</template>
