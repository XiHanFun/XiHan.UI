<!-- 段位可拼装 | segments 决定这份控件由哪几块组成；段位可按段名认领，不必数下标 -->
<script setup lang="ts">
import type { DateSegmentSet } from "@xihan-ui/headless";
import { ref } from "vue";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
} from "@xihan-ui/vue";

// 值的形态不变，仍是 ISO 日期串：季度取那一季的头一个月、周取那一周的周首日
const quarter = ref<string | null>("2026-04-01");
const week = ref<string | null>("2026-08-10");
const at = ref<string | null>("2026-08-17T09");

const QUARTER: DateSegmentSet = ["year", "quarter"];
const WEEK: DateSegmentSet = ["year", "week"];
const AT: DateSegmentSet = ["year", "month", "day", "hour", "dayPeriod"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <XhDateFieldRoot v-model:value="quarter" :segments="QUARTER" locale="zh-CN">
      <XhDateFieldLabel>结算季度</XhDateFieldLabel>
      <XhDateFieldControl>
        <!-- 按段名认领：写死这一格就是年、那一格就是季度，不必数下标 -->
        <XhDateFieldSegment segment="year" />
        <span>-</span>
        <XhDateFieldSegment segment="quarter" />
      </XhDateFieldControl>
    </XhDateFieldRoot>
    <span style="font-size: 13px">{{ quarter ?? "（未填齐）" }}</span>

    <XhDateFieldRoot v-model:value="week" :segments="WEEK" locale="zh-CN">
      <XhDateFieldLabel>排期周</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment segment="year" />
        <span>-</span>
        <XhDateFieldSegment segment="week" />
        <!-- 「周」与「年 / 月 / 日」一样是普通节点，段位自己只出数字 -->
        <span>周</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>
    <span style="font-size: 13px">{{ week ?? "（未填齐）" }}（那一周的周首日）</span>

    <XhDateFieldRoot v-model:value="at" :segments="AT" locale="zh-CN">
      <XhDateFieldLabel>开始时间</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment segment="year" />
        <span>-</span>
        <XhDateFieldSegment segment="month" />
        <span>-</span>
        <XhDateFieldSegment segment="day" />
        <span>&nbsp;</span>
        <!-- 段集里带上下午时，小时段收的是 12 时制的那个数；a / p 键直接指定 -->
        <XhDateFieldSegment segment="hour" />
        <span>&nbsp;</span>
        <XhDateFieldSegment segment="dayPeriod" />
      </XhDateFieldControl>
    </XhDateFieldRoot>
    <span style="font-size: 13px">{{ at ?? "（未填齐）" }}</span>
  </div>
</template>
