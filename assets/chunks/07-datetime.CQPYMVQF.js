const e=`<!-- 日期与时间 | 同时选择日期和时间 -->
<script setup lang="ts">
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
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhDatePickerRoot v-slot="{ weeks, weekDays }" show-time locale="zh-CN">
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
</template>
`;export{e as default};
