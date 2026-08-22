<!-- 12 小时制 | hour-cycle=12 多出一个上午/下午段，值本身仍是 24 小时的串 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const value = ref("13:45");
</script>

<template>
  <XhTimeFieldRoot v-model:value="value" :hour-cycle="12">
    <XhTimeFieldLabel>会议时间</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
        <span>&nbsp;</span>
        <!-- 在这一段上按 a / p 直接指定上下午，翻面只改值不改数字 -->
        <XhTimeFieldSegment segment="dayPeriod" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
  </XhTimeFieldRoot>

  <span style="font-size: 13px">当前值：{{ value || "（未填齐）" }}</span>
</template>
