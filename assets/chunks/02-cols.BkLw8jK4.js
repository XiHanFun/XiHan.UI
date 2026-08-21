const t=`<!-- 列数 | cols 收 1 到 12 的整数；各列等宽，放不下的格子自动换到下一行 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle =
  "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const columns = [2, 3, 4, 6];
const cells = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸", "子", "丑"];
<\/script>

<template>
  <XhGridRoot gap="lg">
    <XhGridItem v-for="n in columns" :key="n">
      <div :style="labelStyle">cols = {{ n }}</div>
      <XhGridRoot :cols="n" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cells.slice(0, n * 2)" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 各列等宽不够用时，直接给使用者槽位写一份轨道表，它排在所有列数档之前 -->
    <XhGridItem>
      <div :style="labelStyle">槽位覆盖：侧栏定宽、正文吃掉剩下的宽度</div>
      <XhGridRoot gap="sm" style="--xh-grid-columns: 160px 1fr; margin-block-start: 6px">
        <XhGridItem :style="cellStyle">侧栏</XhGridItem>
        <XhGridItem :style="cellStyle">正文</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
`;export{t as default};
