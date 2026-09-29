const n=`<!-- 百万点采集曲线 | data 写成 createColumnStore 建的列式数据：一百万个采样点按像素列降采样，尖峰不丢；缩放、悬停、键盘与数据表照常 -->
<script setup lang="ts">
import { createColumnStore, XhCartesianChartRoot } from "@xihan-ui/vue";

// 振动传感器 1 kHz 采样一千秒：一百万个点，由序号算出，每次打开都长一样；每隔十万个点左右有一次冲击
const count = 1_000_000;
const t = new Float64Array(count);
const v = new Float64Array(count);
const start = Date.UTC(2026, 8, 1, 8);
for (let i = 0; i < count; i++) {
  t[i] = start + i;
  v[i] = Math.sin(i / 20000) * 2 + Math.sin(i / 7) * 0.4 + (i % 99991 === 50000 ? 6 : 0);
}
const samples = createColumnStore({ fields: ["t", "v"], columns: { t, v } });

// 列式数据总是画在画布上；放大后数值轴只按窗口里露出的点取
const series = [{ mark: "line", x: "t", y: "v", name: "振幅" }] as const;
const annotations = [{ kind: "point", series: "v", at: "max" }] as const;
<\/script>

<template>
  <XhCartesianChartRoot
    :data="samples"
    :series="series"
    :x-axis="{ scale: 'utc' }"
    :y-axis="{ title: '振幅（mm/s）', fit: 'window' }"
    :annotations="annotations"
    zoom="x"
  >
    <template #caption>振动采集</template>
  </XhCartesianChartRoot>
</template>
`;export{n as default};
