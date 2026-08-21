const e=`<!-- 12 小时制 | 时列写的是显示值 01-12，落到哪个真实小时由上下午说了算：输入行里敲、浮层里挑都改它 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerInput,
  XhTimePickerLabel,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
} from "@xihan-ui/vue";

const value = ref("09:30");
<\/script>

<template>
  <XhTimePickerRoot v-model:value="value" :hour-cycle="12" locale="zh-CN">
    <XhTimePickerLabel>提醒时间</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerInput segment="hour" />
      <span>:</span>
      <XhTimePickerInput segment="minute" />
      <XhTimePickerInput segment="dayPeriod" />
      <XhTimePickerClearTrigger>✕</XhTimePickerClearTrigger>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <!-- 上下午列只在 12 小时制下出现；格子上的文字由组件按 locale 填 -->
        <XhTimePickerColumn v-slot="{ options }" unit="dayPeriod">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">值仍是 24 小时的串：{{ value || "（空）" }}</span>
</template>
`;export{e as default};
