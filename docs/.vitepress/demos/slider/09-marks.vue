<!-- 轨道刻度 | 刻度是作者写进 track 里的普通节点：按值算出百分比绝对定位；轨道不裁剪，刻度线与文字都露得出来，内容随便写 -->
<script setup lang="ts">
import type { CSSProperties } from "vue";
import { ref } from "vue";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const min = 0;
const max = 200;

const volume = ref([120]);

const marks = [
  { value: 0, text: "静音" },
  { value: 60, text: "60" },
  { value: 120, text: "★ 推荐" },
  { value: 200, text: "200" },
];

// 值在轨道上的位置
function offset(value: number) {
  return `${((value - min) / (max - min)) * 100}%`;
}

const mark: CSSProperties = {
  position: "absolute",
  insetBlockStart: "-2px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  transform: "translateX(-50%)",
  whiteSpace: "nowrap",
  // 刻度只是装饰，指针照旧交给轨道
  pointerEvents: "none",
};

const tick: CSSProperties = {
  inlineSize: "2px",
  blockSize: "10px",
  borderRadius: "1px",
  background: "var(--xh-border-strong)",
};

const text: CSSProperties = {
  fontSize: "11px",
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <div style="inline-size: 320px; padding-block-end: 24px">
    <XhSliderRoot
      v-model:value="volume"
      :min="min"
      :max="max"
      :step="10"
      name="volume"
    >
      <XhSliderLabel>音量：{{ volume[0] }}</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
          <span
            v-for="item in marks"
            :key="item.value"
            :style="[mark, { insetInlineStart: offset(item.value) }]"
          >
            <span :style="tick"></span>
            <span :style="text">{{ item.text }}</span>
          </span>
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
  </div>
</template>
