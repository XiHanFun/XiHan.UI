<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 并排两个月 | visible-count=2：起止常跨月，并排看两页才好挑；翻页时整窗一起走 -->
<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["2026-09-28", "2026-10-06"]);
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ panels, weekDays }"
    v-model:value="value"
    default-focused-value="2026-09-28"
    locale="zh-CN"
    :visible-count="2"
    fixed-weeks
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
      <!-- 两张面板各有自己的标题，翻页按钮只有一对 -->
      <XhCalendarRangePickerHeading v-for="panel in panels" :key="panel.index" :index="panel.index" />
      <XhCalendarRangePickerNextTrigger aria-label="下个月" />
    </XhCalendarRangePickerHeader>
    <div style="display: flex; gap: 16px">
      <XhCalendarRangePickerGrid v-for="panel in panels" :key="panel.index" :index="panel.index">
        <XhCalendarRangePickerGridHead>
          <XhCalendarRangePickerWeekRow>
            <XhCalendarRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
          </XhCalendarRangePickerWeekRow>
        </XhCalendarRangePickerGridHead>
        <XhCalendarRangePickerGridBody>
          <XhCalendarRangePickerWeekRow v-for="week in panel.weeks" :key="week[0].start">
            <!-- 同一天会同时出现在两张面板里，格子得自报属于哪一张 -->
            <XhCalendarRangePickerCell v-for="day in week" :key="day.start" :value="day.start" :index="panel.index">
              <XhCalendarRangePickerCellTrigger>{{ day.day }}</XhCalendarRangePickerCellTrigger>
            </XhCalendarRangePickerCell>
          </XhCalendarRangePickerWeekRow>
        </XhCalendarRangePickerGridBody>
      </XhCalendarRangePickerGrid>
    </div>
  </XhCalendarRangePickerRoot>

  <span style="font-size: 13px">区间：{{ value.length === 2 ? `${value[0]} → ${value[1]}` : "（未选）" }}</span>
</template>
