<!-- 格内对齐 | align 管每一项在自己那格里的块向落点，justify 管行内落点；两轴缺省都是铺满整格 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle =
  "padding: 8px 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const tallStyle = `${cellStyle}; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong)`;
const trackStyle =
  "border: 1px solid var(--xh-border-default); border-radius: var(--xh-radius-md); padding: 8px; margin-block-start: 6px";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const aligns = ["start", "center", "end", "stretch"] as const;
const justifies = ["start", "center", "end", "stretch"] as const;
</script>

<template>
  <XhGridRoot gap="lg">
    <!-- 第一格把整行撑高，另外两格才有块向落点可看 -->
    <XhGridItem v-for="a in aligns" :key="a">
      <div :style="labelStyle">align = {{ a }}</div>
      <XhGridRoot :cols="3" gap="sm" :align="a" :style="trackStyle">
        <XhGridItem :style="tallStyle">这一格内容多<br />把整行撑高<br />共三行</XhGridItem>
        <XhGridItem :style="cellStyle">乙</XhGridItem>
        <XhGridItem :style="cellStyle">丙</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 内容比列窄，才看得出行内落点；stretch 下每一格铺满整列 -->
    <XhGridItem v-for="j in justifies" :key="j">
      <div :style="labelStyle">justify = {{ j }}</div>
      <XhGridRoot :cols="3" gap="sm" :justify="j" :style="trackStyle">
        <XhGridItem :style="cellStyle">甲</XhGridItem>
        <XhGridItem :style="cellStyle">乙</XhGridItem>
        <XhGridItem :style="cellStyle">丙</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
