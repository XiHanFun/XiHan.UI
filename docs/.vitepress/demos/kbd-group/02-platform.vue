<!-- 平台 | 使用对应平台的修饰键格式 -->
<script setup lang="ts">
import { XhKbdGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhKbdGroup :keys="['Mod', 'S']" platform="mac" />
  <XhKbdGroup :keys="['Mod', 'S']" platform="other" />
</template>
