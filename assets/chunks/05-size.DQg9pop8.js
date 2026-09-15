const e=`<!-- 尺寸 | size 只改轨道厚度，不写即缺省中档 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 16px">
    <div style="display: flex; gap: 12px; align-items: center">
      <span style="min-width: 64px; font-size: 13px; opacity: 0.7">sm</span>
      <XhProgress :value="65" size="sm" style="flex: 1" />
    </div>
    <div style="display: flex; gap: 12px; align-items: center">
      <span style="min-width: 64px; font-size: 13px; opacity: 0.7">缺省</span>
      <XhProgress :value="65" style="flex: 1" />
    </div>
    <div style="display: flex; gap: 12px; align-items: center">
      <span style="min-width: 64px; font-size: 13px; opacity: 0.7">lg</span>
      <XhProgress :value="65" size="lg" style="flex: 1" />
    </div>
  </div>
</template>
`;export{e as default};
