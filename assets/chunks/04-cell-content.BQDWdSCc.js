const e=`<!-- 格子内放置内容 | cell-trigger 的内容全部由作者编写，日号之外还可放置自己的标记 -->
<script setup lang="ts">
import {
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
<\/script>

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
              <span style="display: grid; justify-items: center; gap: 2px">
                <span>{{ day.day }}</span>
                <!-- 没安排的日子把这颗点隐掉，不是删掉 -->
                <span
                  :style="{
                    fontSize: '10px',
                    lineHeight: '1',
                    visibility: hasPlan(day.start) ? 'visible' : 'hidden',
                  }"
                >
                  •
                </span>
              </span>
            </XhCalendarPickerCellTrigger>
          </XhCalendarPickerCell>
        </XhCalendarPickerWeekRow>
      </XhCalendarPickerGridBody>
    </XhCalendarPickerGrid>
  </XhCalendarPickerRoot>

  <span style="font-size: 13px">选中：{{ value[0] ?? "（未选）" }}</span>
</template>
`;export{e as default};
