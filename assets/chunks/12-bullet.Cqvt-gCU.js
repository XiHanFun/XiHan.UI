var e=`<!-- 子弹图 | 线形的量加上分段与目标：色带是好坏区间，中间一条是实际值，竖线是目标，下方是量程刻度 -->
<script setup lang="ts">
import type { ProgressThreshold } from "@xihan-ui/headless";
import { XhProgress } from "@xihan-ui/vue";

// 本季销售额（万元）：0–240 差、240–320 良、320–400 优，目标 340
const ranges: ProgressThreshold[] = [
  { value: 240, tone: "danger", label: "差" },
  { value: 320, tone: "warning", label: "良" },
  { value: 400, tone: "success", label: "优" },
];
<\/script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-2)', inlineSize: '100%', maxInlineSize: '28rem' }">
    <span :style="{ color: 'var(--xh-fg-muted)', fontSize: 'var(--xh-text-caption-size)' }">本季销售额（万元）</span>
    <XhProgress
      semantics="meter"
      :value="286"
      :max="400"
      :thresholds="ranges"
      :target="340"
      scale
      aria-label="本季销售额"
      :translations="{ segmentValueText: ({ value, label }) => \`\${value}，\${label}\` }"
    />
  </div>
</template>
`;export{e as default};