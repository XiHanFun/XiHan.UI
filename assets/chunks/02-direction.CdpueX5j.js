const n=`<!-- 方向 | direction 换主轴：row 横排（缺省），column 竖排 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const boxStyle =
  "padding: 8px 14px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";
<\/script>

<template>
  <XhFlex direction="column" gap="lg">
    <XhFlex direction="column" gap="xs">
      <span :style="labelStyle">row（缺省）</span>
      <XhFlex gap="sm">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>

    <XhFlex direction="column" gap="xs">
      <span :style="labelStyle">column</span>
      <XhFlex direction="column" gap="sm">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>
  </XhFlex>
</template>
`;export{n as default};
