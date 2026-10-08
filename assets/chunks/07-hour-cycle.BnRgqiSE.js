var e=`<!-- 12 小时制 | hourCycle=12 时时间列末位多出上下午列，输入行也多出上下午段；值仍是 24 小时制的 ISO 串 -->
<script setup lang="ts">
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerConfirmTrigger,
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
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["2026-09-28T21:30"]);

function literalBefore(type: string, index: number): string {
  if (index === 0)
    return "";
  if (type === "hour" || type === "dayPeriod")
    return " ";
  if (type === "minute")
    return ":";
  return "/";
}
<\/script>

<template>
  <XhDatePickerRoot v-slot="{ weeks, weekDays, segments }" v-model:value="value" show-time :hour-cycle="12" locale="en-US">
    <XhDatePickerLabel>Pickup</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <template v-for="(segment, index) in segments" :key="segment.type">
          <span v-if="index > 0">{{ literalBefore(segment.type, index) }}</span>
          <XhDatePickerSegment :index="index" />
        </template>
      </XhDatePickerSegmentGroup>
      <XhDatePickerClearTrigger />
      <XhDatePickerTrigger />
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <div style="display: flex; align-items: stretch">
          <XhDatePickerCalendar>
            <XhDatePickerHeader>
              <XhDatePickerPrevTrigger aria-label="Previous month" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger aria-label="Next month" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <XhDatePickerGridHead>
                <XhDatePickerWeekRow>
                  <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                </XhDatePickerWeekRow>
              </XhDatePickerGridHead>
              <XhDatePickerGridBody>
                <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].start">
                  <XhDatePickerCell v-for="day in week" :key="day.start" :value="day.start">
                    <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                  </XhDatePickerCell>
                </XhDatePickerWeekRow>
              </XhDatePickerGridBody>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
          <!-- 时、分、上下午三列；上下午那一格的字按 locale 现译 -->
          <XhDatePickerTimePanel />
        </div>
        <div style="display: flex; align-items: center; justify-content: flex-end; margin-block-start: var(--xh-space-2); margin-inline: calc(-1 * var(--xh-space-2)); margin-block-end: calc(-1 * var(--xh-space-2)); padding-block: var(--xh-space-1); padding-inline: var(--xh-space-2); border-block-start: var(--xh-stroke-thin) solid var(--xh-border-subtle)">
          <XhDatePickerConfirmTrigger>OK</XhDatePickerConfirmTrigger>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（空）" }}</span>
</template>
`;export{e as default};