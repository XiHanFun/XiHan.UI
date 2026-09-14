<!-- 形状 | 轨道与滑块共用同一个形状令牌，在实例上覆盖一次两者一起变方 -->
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked style="--xh-shape-pill: 0" />
      <span>直角</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked style="--xh-shape-pill: 5px" />
      <span>圆角</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked />
      <span>缺省</span>
    </span>
  </div>
</template>
