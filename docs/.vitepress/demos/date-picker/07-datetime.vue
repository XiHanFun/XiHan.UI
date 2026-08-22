<!-- 日期加时间 | show-time 让值升格为一体化 datetime：日历右侧多出时/分两列，选完日子不收起、时间列点选写值、确认钮收口 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerSegmentGroup,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerTimePanel,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

const stamp = ref<string[]>([]);
</script>

<template>
  <XhDatePickerRoot v-slot="{ weeks, weekDays }" v-model:value="stamp" show-time locale="zh-CN">
    <XhDatePickerLabel>会议开始</XhDatePickerLabel>
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
        <div style="display: flex; align-items: stretch">
          <XhDatePickerCalendar>
            <XhDatePickerHeader>
              <XhDatePickerPrevTrigger aria-label="上个月" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger aria-label="下个月" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <XhDatePickerGridHead>
                <XhDatePickerWeekRow>
                  <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                </XhDatePickerWeekRow>
              </XhDatePickerGridHead>
              <XhDatePickerGridBody>
                <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                  <XhDatePickerCell v-for="day in week" :key="day.value" :value="day.value">
                    <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                  </XhDatePickerCell>
                </XhDatePickerWeekRow>
              </XhDatePickerGridBody>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
          <XhDatePickerTimePanel />
        </div>
        <div style="display: flex; justify-content: flex-end; margin-block-start: 8px">
          <XhDatePickerConfirmTrigger>确定</XhDatePickerConfirmTrigger>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>
  <p>已选：{{ stamp[0] ?? "（未选）" }}</p>
</template>
