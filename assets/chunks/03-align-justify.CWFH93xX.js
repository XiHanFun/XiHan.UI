const n=`<!-- 对齐与分布 | justify 管主轴怎么分，align 管交叉轴怎么对；两条轴互不相干 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const trackStyle =
  "border: 1px solid var(--xh-border-default); border-radius: var(--xh-radius-md); padding: 8px; block-size: 72px";
const boxStyle =
  "padding: 8px 14px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const tallBoxStyle = \`\${boxStyle}; padding-block: 20px\`;
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const justifies = ["start", "center", "end", "between"] as const;
const aligns = ["start", "center", "end", "stretch"] as const;
<\/script>

<template>
  <XhFlex direction="column" gap="lg">
    <XhFlex v-for="j in justifies" :key="j" direction="column" gap="xs">
      <span :style="labelStyle">justify = {{ j }}</span>
      <!-- 轨道给了固定高度，主轴上才有多余空间可分 -->
      <XhFlex :justify="j" gap="sm" align="center" :style="trackStyle">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>

    <XhFlex v-for="a in aligns" :key="a" direction="column" gap="xs">
      <span :style="labelStyle">align = {{ a }}</span>
      <XhFlex :align="a" gap="sm" :style="trackStyle">
        <span :style="boxStyle">甲</span>
        <span :style="tallBoxStyle">乙（更高）</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>
  </XhFlex>
</template>
`;export{n as default};
