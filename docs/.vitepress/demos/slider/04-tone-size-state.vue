<!-- 语气、尺寸与状态 | tone 决定已填轨道与滑块使用哪族颜色，不写时沿用品牌色；size 改变轨道厚度与滑块直径，不写即默认中档；禁用的拇指退出 Tab 序列、值也不再随表单提交，只读仍可聚焦与朗读，只是不可推动 -->
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-8)">
    <div style="display: grid; gap: var(--xh-space-4)">
      <XhSliderRoot
        v-for="t in tones"
        :key="t"
        :tone="t"
        :default-value="[60]"
        style="inline-size: 280px"
      >
        <XhSliderLabel>{{ t }}</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
    </div>

    <div style="display: grid; gap: var(--xh-space-5)">
      <XhSliderRoot :default-value="[50]" size="sm" style="inline-size: 280px">
        <XhSliderLabel>sm</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>

      <XhSliderRoot :default-value="[50]" style="inline-size: 280px">
        <XhSliderLabel>缺省</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>

      <XhSliderRoot :default-value="[50]" size="lg" style="inline-size: 280px">
        <XhSliderLabel>lg</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
    </div>

    <div style="display: grid; gap: var(--xh-space-4)">
      <XhSliderRoot :default-value="[60]" disabled name="brightness" style="inline-size: 280px">
        <XhSliderLabel>禁用</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>

      <XhSliderRoot :default-value="[60]" read-only style="inline-size: 280px">
        <XhSliderLabel>只读</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
    </div>
  </div>
</template>
