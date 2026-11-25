<!-- 自定义外观 | 轨道色、进度段色、轨道厚度与环的直径、端点各是一个组件令牌，纯色与渐变都可以使用；环的线宽经 strokeWidth：它改变的是几何，半径随之向内收缩 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: var(--xh-space-6)">
    <div style="display: grid; gap: var(--xh-space-4)">
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

    <div style="display: flex; align-items: center; gap: var(--xh-space-6); flex-wrap: wrap">
      <!-- 线宽是 prop：半径要跟着它变，算在几何里而不是皮肤里 -->
      <XhProgress variant="circle" :value="64" :stroke-width="2" />
      <XhProgress variant="circle" :value="64" :stroke-width="14" />

      <!-- 直径、底槽色与端点形状走令牌 -->
      <XhProgress
        variant="circle"
        :value="64"
        style="
          --xh-progress-size: 140px;
          --xh-progress-track: #e9d5ff;
          --xh-progress-range: #7c3aed;
          --xh-progress-linecap: butt;
        "
      />
    </div>
  </div>
</template>
