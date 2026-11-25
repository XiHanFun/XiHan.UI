<!-- 形态、语气、尺寸与状态 | variant 只改变分段框的底色与描边用法，tone 与 variant 正交，size 让行高、内边距与字号连同标题一起换档，分段结构与键盘行为都不变；禁用整组退出 Tab 序列，越界只做标注，08:00 原样保留不被改写 -->
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-8)">
    <div style="display: grid; gap: var(--xh-space-4); justify-items: start">
      <XhTimeFieldRoot v-for="v in variants" :key="v" :variant="v" default-value="09:30">
        <XhTimeFieldLabel>{{ v }}</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-4)">
      <XhTimeFieldRoot v-for="t in tones" :key="t" variant="subtle" :tone="t" default-value="09:30">
        <XhTimeFieldLabel>{{ t }}</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--xh-space-4)">
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

    <div style="display: grid; gap: var(--xh-space-4); justify-items: start">
      <XhTimeFieldRoot default-value="13:45" disabled>
        <XhTimeFieldLabel>禁用</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>

      <XhTimeFieldRoot default-value="08:00" min="09:00" max="18:00">
        <XhTimeFieldLabel>越界（09:00 – 18:00）</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>
    </div>
  </div>
</template>
