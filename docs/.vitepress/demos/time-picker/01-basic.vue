<!-- 基础用法 | 点输入行任意处即展开，不必再去点小箭头；段位与列写的是同一个值，段上敲、列里挑，另一边当场跟着改口 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerInput,
  XhTimePickerLabel,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
} from "@xihan-ui/vue";

const value = ref("");
</script>

<template>
  <XhTimePickerRoot v-model:value="value" name="start">
    <XhTimePickerLabel>会议开始</XhTimePickerLabel>
    <XhTimePickerControl>
      <!-- 段不写内容：显示什么由组件按当前值填，空段是占位串 -->
      <XhTimePickerInput segment="hour" />
      <span>:</span>
      <XhTimePickerInput segment="minute" />
      <XhTimePickerClearTrigger />
    </XhTimePickerControl>
    <!-- 表单出口：随表单提交的是完整 ISO 串 -->
    <XhTimePickerHiddenInput />
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- 可选值由 step 与小时制算出来，作者照它渲染 -->
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
