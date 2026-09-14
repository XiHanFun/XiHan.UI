<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 周期区间 | granularity 决定两组输入行铺哪几段、浮层铺哪一档格子 -->
<script setup lang="ts">
import type { CalendarGranularity } from "@xihan-ui/headless";
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/vue";

const kinds: { key: string; label: string; granularity: CalendarGranularity }[] = [
  { key: "week", label: "周报区间", granularity: "week" },
  { key: "month", label: "月报区间", granularity: "month" },
  { key: "quarter", label: "季报区间", granularity: "quarter" },
  { key: "year", label: "年报区间", granularity: "year" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-5)">
    <XhDateRangePickerRoot
      v-for="k in kinds"
      :key="k.key"
      v-slot="{ panels, weekDays, segments, endSegments }"
      :granularity="k.granularity"
      locale="zh-CN"
      style="--xh-date-range-picker-control-min-w: calc(var(--xh-control-min-w) * 2 + var(--xh-control-h-md) * 2 + var(--xh-space-6))"
    >
      <XhDateRangePickerLabel>{{ k.label }}</XhDateRangePickerLabel>
      <XhDateRangePickerControl>
        <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
        <template v-for="end in 2" :key="end">
          <XhDateRangePickerRangeSeparator v-if="end === 2" />
          <XhDateRangePickerSegmentGroup :index="end - 1">
            <!-- 铺哪几块由 granularity 推；分隔符是普通节点，作者写在段位旁边 -->
            <template v-for="(seg, i) in end === 1 ? segments : endSegments" :key="seg.type">
              <span v-if="i > 0">/</span>
              <XhDateRangePickerSegment :index="i" />
              <span v-if="seg.type === 'week'">周</span>
            </template>
          </XhDateRangePickerSegmentGroup>
        </template>
        <XhDateRangePickerClearTrigger />
        <XhDateRangePickerTrigger />
      </XhDateRangePickerControl>
      <XhDateRangePickerPositioner>
        <XhDateRangePickerContent>
          <!-- 面板号写在日历上，面板内的标题、网格与格子跟着它走 -->
          <XhDateRangePickerCalendar v-for="panel in panels" :key="panel.index" :index="panel.index">
            <XhDateRangePickerHeader>
              <!-- 往前只在最左那张、往后只在最右那张：整窗一起走 -->
              <XhDateRangePickerPrevTrigger v-if="panel.index === 0" aria-label="上一页" />
              <XhDateRangePickerHeading />
              <XhDateRangePickerNextTrigger v-if="panel.index === panels.length - 1" aria-label="下一页" />
            </XhDateRangePickerHeader>
            <XhDateRangePickerGrid>
              <template v-if="panel.weeks.length > 0">
                <XhDateRangePickerGridHead>
                  <XhDateRangePickerWeekRow>
                    <XhDateRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                  </XhDateRangePickerWeekRow>
                </XhDateRangePickerGridHead>
                <XhDateRangePickerGridBody>
                  <XhDateRangePickerWeekRow v-for="week in panel.weeks" :key="week[0].start">
                    <XhDateRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
                      <XhDateRangePickerCellTrigger>{{ day.day }}</XhDateRangePickerCellTrigger>
                    </XhDateRangePickerCell>
                  </XhDateRangePickerWeekRow>
                </XhDateRangePickerGridBody>
              </template>
              <XhDateRangePickerCell v-for="cell in panel.cells" v-else :key="cell.start" :value="cell.start">
                <XhDateRangePickerCellTrigger>{{ cell.label }}</XhDateRangePickerCellTrigger>
              </XhDateRangePickerCell>
            </XhDateRangePickerGrid>
          </XhDateRangePickerCalendar>
        </XhDateRangePickerContent>
      </XhDateRangePickerPositioner>
    </XhDateRangePickerRoot>
  </div>
</template>
