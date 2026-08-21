<!-- 快捷选项 | presets 在浮层里排出一列，点一条整份写进去并收起；日子在组件外算好再传 -->
<script setup lang="ts">
import { datePickerPresetDay } from "@xihan-ui/headless";
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
  XhDatePickerPresets,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 日子在 computed 里算一次。connect 每帧都会跑一遍，把 today() 放进渲染期会跨零点算出两个答案。
// 区间用 datePickerPresetRange(-6, 0) 这类算出 '起/止' 一个串，两端一次落定
const presets = computed(() => [
  { label: "今天", value: datePickerPresetDay(0) },
  { label: "明天", value: datePickerPresetDay(1) },
  { label: "一周后", value: datePickerPresetDay(7) },
]);
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    :presets="presets"
    locale="zh-CN"
  >
    <XhDatePickerLabel>提醒日期</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerInput>
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerInput>
      <XhDatePickerClearTrigger />
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <!-- 不写默认插槽就按 presets 数据自动铺，产出的 DOM 与手写部件一致 -->
        <XhDatePickerPresets />
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
              <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                <XhDatePickerCell
                  v-for="day in week"
                  :key="day.value"
                  :value="day.value"
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

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（未选）" }}</span>
</template>
