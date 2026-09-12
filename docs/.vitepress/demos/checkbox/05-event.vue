<!-- 禁用与只读 | 区分不可用与不可修改状态 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhCheckbox disabled>禁用</XhCheckbox>
    <XhCheckbox default-checked disabled>已选中且禁用</XhCheckbox>
    <XhCheckbox default-checked read-only>只读</XhCheckbox>
  </div>
</template>
