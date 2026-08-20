<!-- 基础用法 | 一整年铺成周列 × 星期行的方格阵，颜色深浅表示当天数值落在第几档 -->
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;

// 一整年的提交量：工作日多、周末少，三月与十月各有一波冲刺，八月是长假的空档。
// 数值由天序号哈希出来，同一年恒出同一份数据，示例每次打开都长一样
function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const month = at.getUTCMonth();
    // 冲刺月的量翻倍，八月压到最低；周末一律减半
    const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? peak / 2 : peak;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.16 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);
</script>

<template>
  <!-- 不写默认插槽即按区间自动铺开：月份行、七行星期与图例一并渲染。
       一整年 53 列，一屏放不下时网格自己横着滚，行首的星期名钉在原地 -->
  <XhHeatmapRoot
    :value="activity"
    start-date="2024-01-01"
    end-date="2024-12-31"
  />
</template>
