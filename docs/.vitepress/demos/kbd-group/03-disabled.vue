<!-- 禁用 | 表示对应动作不可用 -->
<script setup lang="ts">
import { XhKbdGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhKbdGroup :keys="['Mod', 'S']" disabled />
</template>
