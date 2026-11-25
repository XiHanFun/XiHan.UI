<!-- 形态、语气、尺寸与状态 | variant 决定描边与底色的绘制方式、tone 决定使用哪族颜色、size 切换几何档，三者只落在 root，浮层中的格子一并随之变化；禁用整条退出 Tab 序列，只读仍能展开浏览只是不可修改值，invalid 只改变标注 -->
<script setup lang="ts">
import type { ControlVariant, Size, Tone } from "@xihan-ui/core";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <!-- 前三行一行只换一根轴，标题写的就是那一档的取值 -->
    <div
      v-for="(row, i) in [variants, tones, sizes]"
      :key="i"
      style="display: flex; flex-wrap: wrap; gap: var(--xh-space-4)"
    >
      <XhTimePickerRoot
        v-for="v in row"
        :key="v"
        :variant="i === 0 ? (v as ControlVariant) : undefined"
        :tone="i === 1 ? (v as Tone) : undefined"
        :size="i === 2 ? (v as Size) : undefined"
        default-value="09:30"
      >
        <XhTimePickerLabel>{{ v }}</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
          <XhTimePickerClearTrigger />
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

    <!-- 末行切状态 -->
    <div style="display: grid; gap: var(--xh-space-4); justify-items: start">
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
  </div>
</template>
