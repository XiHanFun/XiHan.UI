<!-- 自定义外观 | 轨道色、进度段色与轨道厚度各是一个组件令牌，纯色与渐变都塞得进去 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 16px">
    <!-- 进度段与轨道各换一个颜色，语气档之外的配色写在这里 -->
    <XhProgress
      :value="45"
      style="--xh-progress-range: #f0a020; --xh-progress-track: rgba(240, 160, 32, 0.2)"
    />

    <!-- 进度段接的是 background，写渐变一样成立 -->
    <XhProgress
      :value="80"
      style="--xh-progress-range: linear-gradient(90deg, #22d3ee, #2563eb)"
    />

    <!-- 厚度是单独一个令牌，三个尺寸档之外的数值直接写死 -->
    <XhProgress :value="60" style="--xh-progress-thickness: 14px" />
  </div>
</template>
