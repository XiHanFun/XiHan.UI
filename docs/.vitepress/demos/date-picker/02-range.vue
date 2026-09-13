<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 区间选择 | 选择开始和结束日期 -->
<script setup lang="ts">
import type { CalendarGranularity } from "@xihan-ui/headless";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerRangeSeparator,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

const kinds = [
  { key: "day", label: "旅行日期", granularity: "day" as CalendarGranularity },
];

const translations = { startDate: "开始", endDate: "结束" };
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <XhDatePickerRoot
      v-for="k in kinds"
      :key="k.key"
      v-slot="{ panels, weekDays, segments, endSegments }"
      :translations="translations"
      :granularity="k.granularity"
      selection-mode="range"
      locale="zh-CN"
      style="--xh-date-picker-control-min-w: 20rem"
    >
      <XhDatePickerLabel>{{ k.label }}</XhDatePickerLabel>
      <XhDatePickerControl>
        <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
        <template v-for="end in 2" :key="end">
          <XhDatePickerRangeSeparator v-if="end === 2" />
          <XhDatePickerSegmentGroup :index="end - 1">
            <!-- 铺哪几块由 granularity 推；分隔符是普通节点，作者写在段位旁边 -->
            <template v-for="(seg, i) in end === 1 ? segments : endSegments" :key="seg.type">
              <span v-if="i > 0">/</span>
              <XhDatePickerSegment :index="i" />
              <span v-if="seg.type === 'week'">周</span>
            </template>
          </XhDatePickerSegmentGroup>
        </template>
        <XhDatePickerClearTrigger />
        <XhDatePickerTrigger />
      </XhDatePickerControl>
      <XhDatePickerPositioner>
        <XhDatePickerContent>
          <!-- 面板号写在日历上，面板内的标题、网格与格子跟着它走 -->
          <XhDatePickerCalendar v-for="panel in panels" :key="panel.index" :index="panel.index">
            <XhDatePickerHeader>
              <!-- 往前只在最左那张、往后只在最右那张：整窗一起走 -->
              <XhDatePickerPrevTrigger v-if="panel.index === 0" aria-label="上一页" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger v-if="panel.index === panels.length - 1" aria-label="下一页" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <template v-if="panel.weeks.length > 0">
                <XhDatePickerGridHead>
                  <XhDatePickerWeekRow>
                    <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                  </XhDatePickerWeekRow>
                </XhDatePickerGridHead>
                <XhDatePickerGridBody>
                  <XhDatePickerWeekRow v-for="week in panel.weeks" :key="week[0].start">
                    <!-- index 必须给：同一天会同时出现在两个面板里 -->
                    <XhDatePickerCell
                      v-for="day in week"
                      :key="day.start"
                      :value="day.start"
                    >
                      <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                    </XhDatePickerCell>
                  </XhDatePickerWeekRow>
                </XhDatePickerGridBody>
              </template>
              <XhDatePickerCell
                v-for="cell in panel.cells"
                v-else
                :key="cell.start"
                :value="cell.start"
              >
                <XhDatePickerCellTrigger>{{ cell.label }}</XhDatePickerCellTrigger>
              </XhDatePickerCell>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
        </XhDatePickerContent>
      </XhDatePickerPositioner>
    </XhDatePickerRoot>
  </div>
</template>
