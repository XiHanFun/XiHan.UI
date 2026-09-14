<!-- 尺寸 | 不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变 -->
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhTimeFieldRoot v-for="s in sizes" :key="s.label" :size="s.size" default-value="09:30">
      <XhTimeFieldLabel>{{ s.label }}</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
    </XhTimeFieldRoot>
  </div>
</template>
