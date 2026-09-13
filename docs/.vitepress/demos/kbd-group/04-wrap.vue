<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 换行 | 每组内部保持为一个单元 -->
<script setup lang="ts">
import { XhKbdGroup } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px; inline-size: 180px">
    <XhKbdGroup :keys="['Mod', 'Shift', 'P']" />
    <XhKbdGroup :keys="['Alt', 'ArrowDown']" />
    <XhKbdGroup :keys="['Mod', 'Enter']" />
  </div>
</template>
