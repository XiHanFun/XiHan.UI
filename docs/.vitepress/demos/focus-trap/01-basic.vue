<!-- 基础用法 | 打开后焦点进到区域里，Tab 在三颗按钮之间回绕；完成后停用，焦点回到打开它的按钮 -->
<script setup lang="ts">
import { XhButton, XhFocusTrap } from "@xihan-ui/vue";
import { ref } from "vue";

const editing = ref(false);
</script>

<template>
  <XhButton v-if="!editing" @click="editing = true">编辑</XhButton>
  <XhFocusTrap v-else class="demo-trap">
    <XhButton>加粗</XhButton>
    <XhButton>斜体</XhButton>
    <XhButton tone="neutral" @click="editing = false">完成</XhButton>
  </XhFocusTrap>
</template>

<style scoped>
.demo-trap {
  display: flex;
  gap: var(--xh-space-2);
}
</style>
