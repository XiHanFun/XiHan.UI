const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 周期选择 | 粒度与单选/区间彼此独立 -->
<script setup lang="ts">
import type { CalendarGranularity, CalendarPeriod, CalendarSelectionMode } from "@xihan-ui/headless";
import { calendarPeriodOf, calendarPeriodValue } from "@xihan-ui/headless";
import {
  XhButton,
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
  XhDatePickerHeadingMonthTrigger,
  XhDatePickerHeadingYearTrigger,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerNextYearTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerPrevYearTrigger,
  XhDatePickerRangeSeparator,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
  XhToggleGroupItem,
  XhToggleGroupRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const granularities: { value: CalendarGranularity; label: string }[] = [
  { value: "day", label: "天" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
  { value: "quarter", label: "季" },
  { value: "year", label: "年" },
];

const modes: { value: Extract<CalendarSelectionMode, "single" | "range">; label: string }[] = [
  { value: "single", label: "单选" },
  { value: "range", label: "区间" },
];

const granularity = ref<CalendarGranularity>("day");
const selectionMode = ref<"single" | "range">("single");
const value = ref<string[]>([]);

const yearCells: CalendarPeriod[] = Array.from({ length: 200 }, (_, index) =>
  calendarPeriodOf(\`\${1900 + index}-01-01\`, "year", { locale: "zh-CN" })!);

const summary = computed(() => {
  const period = calendarPeriodValue(granularity.value, selectionMode.value, value.value, { locale: "zh-CN" });
  return period ? \`\${period.start} – \${period.end}\` : "尚未选择";
});

function changeGranularity(details: { value: string | string[] | null }) {
  if (typeof details.value === "string")
    granularity.value = details.value as CalendarGranularity;
}

function changeMode(details: { value: string | string[] | null }) {
  if (details.value === "single" || details.value === "range")
    selectionMode.value = details.value;
}
<\/script>

<template>
  <XhDatePickerRoot
    v-slot="{ panels, weekDays, segments, endSegments, clear, setOpen }"
    v-model:value="value"
    :granularity="granularity"
    :selection-mode="selectionMode"
    :close-on-select="false"
    locale="zh-CN"
    style="--xh-date-picker-control-min-w: 22rem"
  >
    <XhDatePickerLabel>统计周期</XhDatePickerLabel>
    <XhDatePickerControl>
      <template v-for="group in selectionMode === 'range' ? 2 : 1" :key="group">
        <XhDatePickerRangeSeparator v-if="group === 2" />
        <XhDatePickerSegmentGroup :index="group - 1">
          <template v-for="(segment, index) in group === 1 ? segments : endSegments" :key="segment.type">
            <span v-if="index > 0">/</span>
            <XhDatePickerSegment :index="index" />
            <span v-if="segment.type === 'week'">周</span>
          </template>
        </XhDatePickerSegmentGroup>
      </template>
      <XhDatePickerClearTrigger />
      <XhDatePickerTrigger />
    </XhDatePickerControl>

    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <div style="display: flex; justify-content: space-between; gap: var(--xh-space-3); padding-block-end: var(--xh-space-2)">
          <XhToggleGroupRoot :value="granularity" disallow-empty size="sm" @value-change="changeGranularity">
            <XhToggleGroupItem v-for="item in granularities" :key="item.value" :value="item.value">
              {{ item.label }}
            </XhToggleGroupItem>
          </XhToggleGroupRoot>
          <XhToggleGroupRoot :value="selectionMode" disallow-empty size="sm" @value-change="changeMode">
            <XhToggleGroupItem v-for="item in modes" :key="item.value" :value="item.value">
              {{ item.label }}
            </XhToggleGroupItem>
          </XhToggleGroupRoot>
        </div>

        <XhDatePickerCalendar v-for="panel in panels" :key="panel.index" :index="panel.index">
          <XhDatePickerHeader>
            <template v-if="granularity === 'year'">
              <XhDatePickerHeading>选择年份</XhDatePickerHeading>
            </template>
            <template v-else>
              <XhDatePickerPrevYearTrigger aria-label="快速向前" />
              <XhDatePickerPrevTrigger aria-label="上一页" />
              <XhDatePickerHeading>
                <XhDatePickerHeadingYearTrigger />
                <XhDatePickerHeadingMonthTrigger />
              </XhDatePickerHeading>
              <XhDatePickerNextTrigger aria-label="下一页" />
              <XhDatePickerNextYearTrigger aria-label="快速向后" />
            </template>
          </XhDatePickerHeader>

          <XhDatePickerGrid>
            <template v-if="panel.weeks.length > 0">
              <XhDatePickerGridHead>
                <XhDatePickerWeekRow>
                  <XhDatePickerWeekDay v-for="day in weekDays" :key="day.value" :value="day.value" />
                </XhDatePickerWeekRow>
              </XhDatePickerGridHead>
              <XhDatePickerGridBody>
                <XhDatePickerWeekRow v-for="week in panel.weeks" :key="week[0].start">
                  <XhDatePickerCell v-for="day in week" :key="day.key" :value="day.start">
                    <XhDatePickerCellTrigger>{{ day.label }}</XhDatePickerCellTrigger>
                  </XhDatePickerCell>
                </XhDatePickerWeekRow>
              </XhDatePickerGridBody>
            </template>
            <XhDatePickerCell
              v-for="period in granularity === 'year' ? yearCells : panel.cells"
              v-else
              :key="period.key"
              :value="period.start"
            >
              <XhDatePickerCellTrigger>{{ period.label }}</XhDatePickerCellTrigger>
            </XhDatePickerCell>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--xh-space-3); margin-block-start: var(--xh-space-2); padding-block-start: var(--xh-space-2); border-block-start: var(--xh-stroke-thin) solid var(--xh-border-subtle)">
          <span>{{ summary }}</span>
          <div style="display: flex; gap: var(--xh-space-2)">
            <XhButton variant="ghost" size="sm" :disabled="value.length === 0" @click="clear">清空</XhButton>
            <XhButton size="sm" :disabled="value.length === 0" @click="setOpen(false)">确定</XhButton>
          </div>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>
</template>
`;export{e as default};
