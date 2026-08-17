<!-- 按周挑 | week-selection 打开后，点任意一天落的是它所在的整整一周（两端一起给），周首日随 locale -->
<script setup lang="ts">
import { computed, ref } from "vue";
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
  XhDatePickerInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

const value = ref<string[]>([]);
const text = computed(() =>
  value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）",
);
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ panels, weekDays }"
    v-model:value="value"
    selection-mode="range"
    week-selection
    :visible-count="1"
    locale="zh-CN"
  >
    <XhDatePickerLabel>结算周</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerInput :index="0">
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerInput>
      <span aria-hidden="true">→</span>
      <XhDatePickerInput :index="1">
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerInput>
      <XhDatePickerClearTrigger>✕</XhDatePickerClearTrigger>
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <XhDatePickerCalendar v-for="panel in panels" :key="panel.index">
          <XhDatePickerHeader>
            <XhDatePickerPrevTrigger aria-label="上个月">‹</XhDatePickerPrevTrigger>
            <XhDatePickerHeading :index="panel.index" />
            <XhDatePickerNextTrigger aria-label="下个月">›</XhDatePickerNextTrigger>
          </XhDatePickerHeader>
          <XhDatePickerGrid :index="panel.index">
            <XhDatePickerGridHead>
              <XhDatePickerWeekRow>
                <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
              </XhDatePickerWeekRow>
            </XhDatePickerGridHead>
            <XhDatePickerGridBody>
              <XhDatePickerWeekRow v-for="week in panel.weeks" :key="week[0].value">
                <XhDatePickerCell
                  v-for="day in week"
                  :key="day.value"
                  :value="day.value"
                  :index="panel.index"
                >
                  <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                </XhDatePickerCell>
              </XhDatePickerWeekRow>
            </XhDatePickerGridBody>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">已选这一周：{{ text }}</span>
</template>
