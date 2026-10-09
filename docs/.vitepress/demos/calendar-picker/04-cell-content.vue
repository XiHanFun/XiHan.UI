<!-- 格子内放置内容 | cell-trigger 的内容全部由作者编写，日号之外还可挂一枚徽标 -->
<script setup lang="ts">
import {
  XhBadge,
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerHeader,
  XhCalendarPickerHeading,
  XhCalendarPickerNextTrigger,
  XhCalendarPickerPrevTrigger,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>([]);

// 每月 1 号与 15 号当作有安排的日子
function hasPlan(iso: string) {
  const day = Number(iso.slice(8, 10));
  return day === 1 || day === 15;
}
</script>

<template>
  <XhCalendarPickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    fixed-weeks
    style="max-inline-size: 360px"
  >
    <XhCalendarPickerHeader>
      <XhCalendarPickerPrevTrigger aria-label="上个月" />
      <XhCalendarPickerHeading />
      <XhCalendarPickerNextTrigger aria-label="下个月" />
    </XhCalendarPickerHeader>
    <XhCalendarPickerGrid>
      <XhCalendarPickerGridHead>
        <XhCalendarPickerWeekRow>
          <XhCalendarPickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarPickerWeekRow>
      </XhCalendarPickerGridHead>
      <XhCalendarPickerGridBody>
        <XhCalendarPickerWeekRow v-for="week in weeks" :key="week[0].start">
          <XhCalendarPickerCell v-for="day in week" :key="day.start" :value="day.start">
            <XhCalendarPickerCellTrigger>
              <!-- 有安排的日子在日号右上角挂一枚圆点徽标；日号下方那颗点留给「今天」 -->
              <XhBadge v-if="hasPlan(day.start)" dot label="有安排">{{ day.day }}</XhBadge>
              <template v-else>{{ day.day }}</template>
            </XhCalendarPickerCellTrigger>
          </XhCalendarPickerCell>
        </XhCalendarPickerWeekRow>
      </XhCalendarPickerGridBody>
    </XhCalendarPickerGrid>
  </XhCalendarPickerRoot>

  <span style="font-size: 13px">选中：{{ value[0] ?? "（未选）" }}</span>
</template>
