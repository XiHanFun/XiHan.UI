<!-- 不归还焦点 | restoreFocus 为 false 时停用后焦点留在原处，适合停用后紧接着要把焦点交给别处的场合 -->
<script setup lang="ts">
import { XhButton, XhFocusTrap } from "@xihan-ui/vue";
import { ref } from "vue";

const active = ref(false);
</script>

<template>
  <div class="demo-row">
    <XhButton :disabled="active" @click="active = true">激活</XhButton>
    <XhFocusTrap :active="active" :restore-focus="false" class="demo-row">
      <XhButton tone="neutral">第一项</XhButton>
      <XhButton tone="neutral" @click="active = false">停用</XhButton>
    </XhFocusTrap>
  </div>
  <p data-demo-output>{{ active ? "焦点陷在右边两颗按钮里" : "未激活" }}</p>
</template>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--xh-space-2);
}
</style>
