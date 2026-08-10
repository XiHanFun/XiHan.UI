<!-- 换掉转圈图形 | 内置圆环画在伪元素上，把直径与描边归零它就不占位；自绘的图形写进默认插槽 -->
<script setup lang="ts">
import { XhIcon, XhSpinner, XhSpinnerLabel } from "@xihan-ui/vue";

// 三个公开令牌一起归零：圆环既不占位也不留间距，间距改由插槽里的内容自己给
const noRing = [
  "--xh-spinner-size: 0",
  "--xh-spinner-thickness: 0",
  "--xh-spinner-gap: 0",
].join("; ");

const ArcIcon = {
  name: "arc",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 3A9 9 0 1 1 5.64 5.64" } },
    { tag: "path", attrs: { d: "M12 8.5A3.5 3.5 0 0 1 15.5 12" } },
  ],
} as const;

// 三个点错开相位地明灭：延迟各差一档，看起来就是一串跑动的点
const dots = [0, 160, 320];

function dotStyle(delay: number): string {
  return [
    "inline-size: 6px",
    "block-size: 6px",
    "border-radius: var(--xh-radius-full)",
    "background: var(--xh-bg-brand)",
    `animation: xh-fade-in 600ms var(--xh-ease-standard) ${delay}ms infinite alternate`,
  ].join("; ");
}
</script>

<template>
  <!-- 自绘图形：转动复用皮肤里的 xh-spin 关键帧，图形本身随便画 -->
  <XhSpinner label="正在同步仓库" :style="noRing">
    <XhIcon
      :icon="ArcIcon"
      size="lg"
      style="--xh-icon-fg: var(--xh-bg-brand); animation: xh-spin 900ms linear infinite"
    />
    <XhSpinnerLabel style="margin-inline-start: 8px" />
  </XhSpinner>

  <!-- 点阵：图形不必是一个整体，几个方块也能当指示器 -->
  <XhSpinner label="正在生成摘要" :style="noRing">
    <span style="display: inline-flex; gap: 4px">
      <span v-for="d in dots" :key="d" :style="dotStyle(d)" />
    </span>
    <XhSpinnerLabel style="margin-inline-start: 8px" />
  </XhSpinner>
</template>
