var e=`<!-- 配文字说明 | 进度条自身只绘制轨道与进度，百分比文字由使用者放置 -->
<script setup lang="ts">
import { XhButton, XhProgress } from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref(64);
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 8px">
    <div style="display: flex; justify-content: space-between">
      <span>上传中</span>
      <span>{{ value }}%</span>
    </div>
    <XhProgress :value="value" />
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="value = Math.max(0, value - 10)">-10</XhButton>
      <XhButton size="sm" variant="outline" @click="value = Math.min(100, value + 10)">+10</XhButton>
    </div>
  </div>
</template>
`;export{e as default};