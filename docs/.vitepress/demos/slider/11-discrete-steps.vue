<!-- 离散档位 | 可选值不必是等距数值：让滑块在档位下标上走，宿主再把下标映射回自己的取值表，键盘与拖动都只落在档位上 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const levels = [1, 5, 10, 50, 100, 500];

const index = ref([2]);

const current = computed(() => levels[index.value[0]]);

function valueText({ value }: { value: number }) {
  return `每页 ${levels[value]} 条`;
}
</script>

<template>
  <div style="inline-size: 320px; display: grid; gap: 12px">
    <XhSliderRoot
      v-model:value="index"
      :min="0"
      :max="levels.length - 1"
      :step="1"
      :large-step="1"
      :get-value-text="valueText"
    >
      <XhSliderLabel>每页 {{ current }} 条</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <span style="font-size: 12px; color: var(--xh-fg-muted)">
      可选：{{ levels.join(" / ") }}
    </span>
  </div>
</template>
