<!-- 多组合换行 | 每组内部不拆行，容器只在完整组合之间换行 -->
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
