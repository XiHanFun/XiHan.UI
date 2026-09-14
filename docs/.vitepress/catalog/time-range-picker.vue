<!-- 提供 time-range-picker 相关实现。 -->

<script setup lang="ts">
import {
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTimeRangePickerRoot :default-value="['09:00', '18:00']" size="sm">
    <XhTimeRangePickerControl>
      <XhTimeRangePickerSegmentGroup :index="0">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerRangeSeparator />
      <XhTimeRangePickerSegmentGroup :index="1">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <XhTimeRangePickerPositioner>
      <XhTimeRangePickerContent />
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>
</template>
