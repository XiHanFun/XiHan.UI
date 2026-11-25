<!-- 语气、尺寸与状态 | tone 决定勾中后方框使用哪族颜色，因此这一行都设为勾中；size 适配不同的界面密度；disabled、readOnly 与 invalid 分别标出不可用、不可修改与必须处理 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-6)">
    <div style="display: flex; align-items: center; gap: var(--xh-space-4); flex-wrap: wrap">
      <XhCheckbox v-for="t in tones" :key="t" :tone="t" default-checked>{{ t }}</XhCheckbox>
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-4)">
      <XhCheckbox size="sm" default-checked>小</XhCheckbox>
      <XhCheckbox default-checked>中</XhCheckbox>
      <XhCheckbox size="lg" default-checked>大</XhCheckbox>
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-4); flex-wrap: wrap">
      <XhCheckbox disabled>禁用</XhCheckbox>
      <XhCheckbox default-checked disabled>已选中且禁用</XhCheckbox>
      <XhCheckbox default-checked read-only>只读</XhCheckbox>
      <XhCheckbox invalid required>我同意服务条款</XhCheckbox>
    </div>
  </div>
</template>
