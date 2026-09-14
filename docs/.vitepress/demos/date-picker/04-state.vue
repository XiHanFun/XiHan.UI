<!-- 状态 | 禁用、只读与校验失败 -->
<script setup lang="ts">
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
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
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhDatePickerRoot
      v-for="s in states"
      :key="s.label"
      v-slot="{ weeks, weekDays }"
      :disabled="s.disabled"
      :read-only="s.readOnly"
      :invalid="s.invalid"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDatePickerLabel>{{ s.label }}</XhDatePickerLabel>
      <XhDatePickerControl>
        <XhDatePickerSegmentGroup>
          <XhDatePickerSegment :index="0" />
          <span>-</span>
          <XhDatePickerSegment :index="1" />
          <span>-</span>
          <XhDatePickerSegment :index="2" />
        </XhDatePickerSegmentGroup>
      </XhDatePickerControl>
      <XhDatePickerPositioner>
        <XhDatePickerContent>
          <XhDatePickerCalendar>
            <XhDatePickerHeader>
              <XhDatePickerPrevTrigger aria-label="上个月" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger aria-label="下个月" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <XhDatePickerGridHead>
                <XhDatePickerWeekRow>
                  <XhDatePickerWeekDay
                    v-for="d in weekDays"
                    :key="d.value"
                    :value="d.value"
                  />
                </XhDatePickerWeekRow>
              </XhDatePickerGridHead>
              <XhDatePickerGridBody>
                <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].start">
                  <XhDatePickerCell
                    v-for="day in week"
                    :key="day.start"
                    :value="day.start"
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
  </div>
</template>
