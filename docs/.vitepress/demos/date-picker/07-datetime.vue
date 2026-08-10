<!-- 日期加时间 | 浮层里日历下面接一台时间输入，选中日期不收起，两份值由宿主拼成一条 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhButton,
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
  XhDatePickerInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
} from "@xihan-ui/vue";

const date = ref<string[]>([]);
const time = ref("09:00");

// 两份值各自受控，对外那条由宿主拼
const stamp = computed(() =>
  date.value[0] && time.value ? `${date.value[0]}T${time.value}` : "（未选完）",
);
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays, setOpen }"
    v-model:value="date"
    :close-on-select="false"
    locale="zh-CN"
  >
    <XhDatePickerLabel>会议开始</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerInput>
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerInput>
      <XhDatePickerTrigger>▾</XhDatePickerTrigger>
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

        <!-- 浮层里的时间输入是作者自己的节点，从日期格按 Tab 就走得过来 -->
        <div
          style="
            display: flex;
            align-items: flex-end;
            gap: 12px;
            margin-block-start: 12px;
          "
        >
          <XhTimeFieldRoot v-model:value="time" size="sm">
            <XhTimeFieldLabel>时间</XhTimeFieldLabel>
            <XhTimeFieldControl>
              <XhTimeFieldSegment segment="hour" />
              <span>:</span>
              <XhTimeFieldSegment segment="minute" />
            </XhTimeFieldControl>
          </XhTimeFieldRoot>
          <XhButton size="sm" @click="setOpen(false)">确定</XhButton>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">拼出来的值：{{ stamp }}</span>
</template>
