<!-- 语气、尺寸与状态 | tone 决定选中态轨道使用哪族颜色，因此这一行都设为开；size 同时缩放轨道与滑块，不写即默认档；disabled 同时阻止指针与键盘，状态机收不到 TOGGLE -->
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <div style="display: flex; align-items: center; gap: var(--xh-space-4); flex-wrap: wrap">
      <span v-for="t in tones" :key="t" style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
        <XhSwitch :tone="t" default-checked />
        <span>{{ t }}</span>
      </span>
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-4)">
      <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
        <XhSwitch size="sm" default-checked />
        <span>小</span>
      </span>
      <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
        <XhSwitch default-checked />
        <span>缺省</span>
      </span>
      <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
        <XhSwitch size="lg" default-checked />
        <span>大</span>
      </span>
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-4)">
      <XhSwitch disabled />
      <XhSwitch disabled default-checked />
    </div>
  </div>
</template>
