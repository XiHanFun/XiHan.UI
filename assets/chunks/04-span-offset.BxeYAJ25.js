const t=`<!-- 跨列与错列 | span 让一格横跨几列；offset 让一格改从第 offset + 1 条列线起排，把它前面那几列空出来 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle =
  "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const markStyle =
  "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const offsets = [1, 2, 3];
<\/script>

<template>
  <XhGridRoot gap="lg">
    <XhGridItem>
      <div :style="labelStyle">span：横跨几列就占几格宽，放不下的自动挤到下一行</div>
      <XhGridRoot :cols="4" gap="sm" style="margin-block-start: 6px">
        <XhGridItem :span="4" :style="markStyle">span = 4</XhGridItem>
        <XhGridItem :span="2" :style="markStyle">span = 2</XhGridItem>
        <XhGridItem :style="cellStyle">甲</XhGridItem>
        <XhGridItem :style="cellStyle">乙</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <XhGridItem>
      <div :style="labelStyle">offset：起排的列线往后挪，前面那几列空着</div>
      <!-- 每档单独一行来看：同一行里前面已经排了东西时，空出来的是那几条列线而不是紧挨着的几格 -->
      <XhGridRoot gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="n in offsets" :key="n">
          <XhGridRoot :cols="4" gap="sm">
            <XhGridItem :offset="n" :span="4 - n" :style="markStyle">offset = {{ n }}</XhGridItem>
          </XhGridRoot>
        </XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <XhGridItem>
      <div :style="labelStyle">两者同写：从第三条列线起排，横跨两列</div>
      <XhGridRoot :cols="4" gap="sm" style="margin-block-start: 6px">
        <XhGridItem :offset="2" :span="2" :style="markStyle">offset = 2，span = 2</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
`;export{t as default};
