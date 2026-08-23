const e=`<!-- 受控展开与事件 | open 交给宿主持有，值、展开、聚焦日三条变化各自播报 -->
<script setup lang="ts">
import { ref } from "vue";
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
  XhDatePickerSegmentGroup,
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
const open = ref(false);
const focused = ref("");

function onFocusedValueChange(details: { focusedValue: string }) {
  focused.value = details.focusedValue;
}
<\/script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    v-model:open="open"
    locale="zh-CN"
    @focused-value-change="onFocusedValueChange"
  >
    <XhDatePickerLabel>排期</XhDatePickerLabel>
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

  <!-- 展开态由外面这颗按钮也能改 -->
  <XhButton size="sm" variant="outline" @click="open = !open">
    {{ open ? "收起" : "展开" }}
  </XhButton>

  <span style="font-size: 13px">
    值：{{ value[0] ?? "（未选）" }} · 聚焦日：{{ focused || "（还没动过）" }}
  </span>
</template>
`;export{e as default};
