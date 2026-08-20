<!-- 笔迹外形 | drawing 调笔宽与压感：thinning 越大，划得越快笔画越细，simulatePressure 决定压感取设备值还是按速度算 -->
<script setup lang="ts">
import { XhSignaturePadControl, XhSignaturePadGuide, XhSignaturePadRoot, XhSignaturePadSegment } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
    <!-- 默认：4px 恒定粗细，压感不参与 -->
    <XhSignaturePadRoot>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadSegment />
      </XhSignaturePadControl>
    </XhSignaturePadRoot>
    <!-- 粗笔加重压感：起笔厚、划快了收细 -->
    <XhSignaturePadRoot :drawing="{ size: 10, thinning: 0.8 }">
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadSegment />
      </XhSignaturePadControl>
    </XhSignaturePadRoot>
  </div>
</template>
