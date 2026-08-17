<!-- 浮层里的快捷选项 | 日历下面这排按钮是作者自己的节点，写值与收起都走根插槽给的入口 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
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

// 相对今天偏移若干天的 ISO 串
function shift(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const shortcuts = [
  { label: "今天", value: shift(0) },
  { label: "明天", value: shift(1) },
  { label: "一周后", value: shift(7) },
];
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays, setValue, setOpen }"
    v-model:value="value"
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
      <XhDatePickerClearTrigger>✕</XhDatePickerClearTrigger>
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <XhDatePickerCalendar>
          <XhDatePickerHeader>
            <XhDatePickerPrevTrigger aria-label="上个月">‹</XhDatePickerPrevTrigger>
            <XhDatePickerHeading />
            <XhDatePickerNextTrigger aria-label="下个月">›</XhDatePickerNextTrigger>
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

        <!-- 选中值恒为数组，写一天也要装进数组里 -->
        <div style="display: flex; gap: 8px; margin-block-start: 12px">
          <XhButton
            v-for="s in shortcuts"
            :key="s.label"
            size="sm"
            variant="outline"
            @click="
              setValue([s.value]);
              setOpen(false);
            "
          >
            {{ s.label }}
          </XhButton>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（未选）" }}</span>
</template>
