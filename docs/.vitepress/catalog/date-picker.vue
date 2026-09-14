<script setup lang="ts">
import {
  XhDatePickerControl,
  XhDatePickerLabel,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDatePickerRoot locale="zh-CN" default-value="2026-09-15">
    <XhDatePickerLabel>交付日期</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <XhDatePickerSegment :index="0" />
        <span>/</span>
        <XhDatePickerSegment :index="1" />
        <span>/</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerSegmentGroup>
      <XhDatePickerTrigger />
    </XhDatePickerControl>
  </XhDatePickerRoot>
</template>
