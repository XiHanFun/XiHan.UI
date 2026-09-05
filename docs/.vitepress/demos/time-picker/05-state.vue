<!-- 禁用 / 只读 / 校验失败 | 禁用整条退出 Tab 序，只读仍能展开浏览只是改不动值，invalid 只改标注 -->
<script setup lang="ts">
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerLabel,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
} from "@xihan-ui/vue";

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhTimePickerRoot
      v-for="s in states"
      :key="s.label"
      :disabled="s.disabled"
      :read-only="s.readOnly"
      :invalid="s.invalid"
      default-value="09:30"
    >
      <XhTimePickerLabel>{{ s.label }}</XhTimePickerLabel>
      <XhTimePickerControl>
        <XhTimePickerSegmentGroup>
          <XhTimePickerSegment segment="hour" />
          <span>:</span>
          <XhTimePickerSegment segment="minute" />
        </XhTimePickerSegmentGroup>
      </XhTimePickerControl>
      <XhTimePickerPositioner>
        <XhTimePickerContent>
          <XhTimePickerColumn v-slot="{ options }" unit="hour">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
          <XhTimePickerColumn v-slot="{ options }" unit="minute">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
        </XhTimePickerContent>
      </XhTimePickerPositioner>
    </XhTimePickerRoot>
  </div>
</template>
