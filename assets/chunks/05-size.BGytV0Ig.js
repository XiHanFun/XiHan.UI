const n=`<!-- 尺寸 | size 同时缩放轨道与滑块，不写就是缺省档 -->
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch size="sm" default-checked />
      <span>小</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked />
      <span>缺省</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch size="lg" default-checked />
      <span>大</span>
    </span>
  </div>
</template>
`;export{n as default};
