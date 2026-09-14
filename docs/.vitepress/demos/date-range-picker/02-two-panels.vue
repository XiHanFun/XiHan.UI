<!-- 两页并排 | 起止常跨月时给 visibleCount=2，两页一起翻 -->
<script setup lang="ts">
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
import { computed, ref } from "vue";

const value = ref<string[]>([]);
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
</script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ panels, weekDays }"
    v-model:value="value"
    :visible-count="2"
    locale="zh-CN"
    style="--xh-date-range-picker-control-min-w: calc(var(--xh-control-min-w) * 2 + var(--xh-control-h-md) * 2 + var(--xh-space-6))"
  >
    <XhDateRangePickerLabel>入住与退房</XhDateRangePickerLabel>
    <XhDateRangePickerControl>
      <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhDateRangePickerSegmentGroup :index="0">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerRangeSeparator />
      <XhDateRangePickerSegmentGroup :index="1">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
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
  <p style="margin-block: var(--xh-space-2) 0; font-size: var(--xh-text-secondary-size)">区间：{{ text }}</p>
</template>
