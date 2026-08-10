<!-- 自定义颜色 | 开态轨道、关态轨道与滑块各是一个组件令牌，语气档之外的配色写在行内 -->
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
    <!-- 只换开态轨道色 -->
    <XhSwitch default-checked style="--xh-switch-bg-checked: #16a34a" />

    <!-- 开关两态各给一色 -->
    <XhSwitch style="--xh-switch-bg: #2080f0; --xh-switch-bg-checked: #d03050" />

    <!-- 滑块也是一个令牌，可以和轨道拉开对比 -->
    <XhSwitch
      default-checked
      style="--xh-switch-bg-checked: #1f2937; --xh-switch-thumb: #facc15"
    />
  </div>
</template>
