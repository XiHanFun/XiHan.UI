<!-- 周期选择 | granularity 决定输入行铺哪几段、浮层铺哪一档格子 -->
<script setup lang="ts">
import type { CalendarGranularity, CalendarPeriod } from "@xihan-ui/headless";
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

const granularity = ref<CalendarGranularity>("day");
const value = ref<string[]>([]);

const yearCells: CalendarPeriod[] = Array.from({ length: 200 }, (_, index) =>
  calendarPeriodOf(`${1900 + index}-01-01`, "year", { locale: "zh-CN" })!);

const summary = computed(() => {
  const period = calendarPeriodValue(granularity.value, "single", value.value, { locale: "zh-CN" });
  return period ? `${period.start} – ${period.end}` : "尚未选择";
});

function changeGranularity(details: { value: string | string[] | null }) {
  if (typeof details.value === "string")
    granularity.value = details.value as CalendarGranularity;
}
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ panels, weekDays, segments, clear, setOpen }"
    v-model:value="value"
    :granularity="granularity"
    :close-on-select="false"
    locale="zh-CN"
    style="--xh-date-picker-control-min-w: 22rem"
  >
    <XhDatePickerLabel>统计周期</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <template v-for="(segment, index) in segments" :key="segment.type">
          <span v-if="index > 0">/</span>
          <XhDatePickerSegment :index="index" />
          <span v-if="segment.type === 'week'">周</span>
        </template>
      </XhDatePickerSegmentGroup>
      <XhDatePickerClearTrigger />
      <XhDatePickerTrigger />
    </XhDatePickerControl>

    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <div style="display: flex; padding-block-end: var(--xh-space-2)">
          <XhToggleGroupRoot :value="granularity" disallow-empty size="sm" @value-change="changeGranularity">
            <XhToggleGroupItem v-for="item in granularities" :key="item.value" :value="item.value">
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
