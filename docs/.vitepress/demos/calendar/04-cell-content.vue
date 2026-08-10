<!-- 格子里放内容 | cell-trigger 的内容全由作者写，日号之外还能塞自己的标记 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/vue";

const value = ref<string[]>([]);

// 每月 1 号与 15 号当作有安排的日子
function hasPlan(iso: string) {
  const day = Number(iso.slice(8, 10));
  return day === 1 || day === 15;
}
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    fixed-weeks
    style="max-inline-size: 360px"
  >
    <XhCalendarHeader>
      <XhCalendarPrevTrigger aria-label="上个月">‹</XhCalendarPrevTrigger>
      <XhCalendarHeading />
      <XhCalendarNextTrigger aria-label="下个月">›</XhCalendarNextTrigger>
    </XhCalendarHeader>
    <XhCalendarGrid>
      <XhCalendarGridHead>
        <XhCalendarWeekRow>
          <XhCalendarWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarWeekRow>
      </XhCalendarGridHead>
      <XhCalendarGridBody>
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].value">
          <XhCalendarCell v-for="day in week" :key="day.value" :value="day.value">
            <XhCalendarCellTrigger>
              <span style="display: grid; justify-items: center; gap: 2px">
                <span>{{ day.day }}</span>
                <!-- 没安排的日子把这颗点隐掉，不是删掉 -->
                <span
                  :style="{
                    fontSize: '10px',
                    lineHeight: '1',
                    visibility: hasPlan(day.value) ? 'visible' : 'hidden',
                  }"
                >
                  •
                </span>
              </span>
            </XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>

  <span style="font-size: 13px">选中：{{ value[0] ?? "（未选）" }}</span>
</template>
