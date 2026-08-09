<!-- 配文字说明 | 进度条自身只画轨道与进度，百分比文字由使用者摆 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhProgress } from "@xihan-ui/vue";

const value = ref(64);
</script>

<template>
  <div style="width: 100%; display: grid; gap: 8px">
    <div style="display: flex; justify-content: space-between">
      <span>上传中</span>
      <span>{{ value }}%</span>
    </div>
    <XhProgress :value="value" />
    <div style="display: flex; gap: 8px">
      <button type="button" @click="value = Math.max(0, value - 10)">-10</button>
      <button type="button" @click="value = Math.min(100, value + 10)">+10</button>
    </div>
  </div>
</template>
