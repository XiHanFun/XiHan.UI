<!-- 线型、粗细与颜色 | 线是拿背景画出来的：颜色槽位收的是背景值，填一段重复渐变就是虚线；粗细是另一个槽位 -->
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";

// 实线段与空白段交替：横线沿 to right 铺，竖线换成 to bottom
const dashed = "repeating-linear-gradient(to right, var(--xh-border-default) 0 6px, transparent 6px 12px)";
const dotted = "repeating-linear-gradient(to right, var(--xh-border-default) 0 2px, transparent 2px 6px)";
const dashedVertical = "repeating-linear-gradient(to bottom, var(--xh-border-default) 0 6px, transparent 6px 12px)";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 10px">
    <span style="font-size: 13px">实线（缺省）</span>
    <XhSeparator decorative />

    <span style="font-size: 13px">虚线</span>
    <XhSeparator decorative :style="{ '--xh-separator-color': dashed }" />

    <span style="font-size: 13px">点线</span>
    <XhSeparator decorative :style="{ '--xh-separator-color': dotted }" />

    <span style="font-size: 13px">加粗并换色</span>
    <XhSeparator
      decorative
      style="--xh-separator-thickness: 3px; --xh-separator-color: var(--xh-color-brand-500)"
    />

    <!-- 竖向同样成立，只把渐变方向换成 to bottom -->
    <div style="display: flex; align-items: center; gap: 12px; height: 32px">
      <span style="font-size: 13px">左</span>
      <XhSeparator
        orientation="vertical"
        decorative
        :style="{ '--xh-separator-color': dashedVertical }"
      />
      <span style="font-size: 13px">右</span>
    </div>
  </div>
</template>
