<!-- 禁用 | 暂时不可执行的操作 -->
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton disabled>主要操作</XhButton>
  <XhButton disabled variant="subtle">次要操作</XhButton>
  <XhButton disabled variant="outline">线框按钮</XhButton>
  <XhButton disabled variant="ghost">幽灵按钮</XhButton>
</template>
