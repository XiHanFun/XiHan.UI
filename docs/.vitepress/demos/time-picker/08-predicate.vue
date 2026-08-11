<!-- 按谓词裁可选值 | 列里渲染哪几格由作者决定，午休两格整段拿掉；手打进段位的时被吸到下一个可约小时 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerInput,
  XhTimePickerLabel,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerTrigger,
} from "@xihan-ui/vue";

// 午休不接待
const closed = [12, 13];

const value = ref("09:00");

// 列里只留通过谓词的那几格
function bookable(options: readonly string[]) {
  return options.filter((o) => !closed.includes(Number(o)));
}

// 落进午休的小时往后挪到最近一个可约的小时
function snap(next: string) {
  if (next === "") return next;
  let hour = Number(next.slice(0, 2));
  while (closed.includes(hour)) hour += 1;
  return `${`${hour}`.padStart(2, "0")}${next.slice(2)}`;
}
</script>

<template>
  <XhTimePickerRoot
    :value="value"
    :step="30"
    min="09:00"
    max="18:00"
    @update:value="value = snap($event)"
  >
    <XhTimePickerLabel>面谈时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerInput segment="hour" />
      <span>:</span>
      <XhTimePickerInput segment="minute" />
      <XhTimePickerTrigger>▾</XhTimePickerTrigger>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- min / max 先裁一遍，这里再按自己的谓词裁一遍；格里的文案也自己写 -->
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in bookable(options)" :key="o" :value="o">
            {{ Number(o) }} 点
          </XhTimePickerItem>
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
