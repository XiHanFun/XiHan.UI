<!-- 方向 | orientation 换排布轴：horizontal 横排（缺省）按中线对齐，vertical 竖排拉伸占满 -->
<script setup lang="ts">
import { XhSpace } from "@xihan-ui/vue";

const boxStyle =
  "padding: 6px 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";
const stackStyle = "display: flex; flex-direction: column; gap: 8px";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div :style="stackStyle">
      <span :style="labelStyle">horizontal（缺省）</span>
      <XhSpace>
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhSpace>
    </div>

    <div :style="stackStyle">
      <span :style="labelStyle">vertical</span>
      <XhSpace orientation="vertical">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhSpace>
    </div>
  </div>
</template>
