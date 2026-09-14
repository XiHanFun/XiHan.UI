<!-- 提供 time-picker 相关实现。 -->

<script setup lang="ts">
import {
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTimePickerRoot default-value="09:30">
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerTrigger />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent />
    </XhTimePickerPositioner>
  </XhTimePickerRoot>
</template>
