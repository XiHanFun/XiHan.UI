var e=`<!-- 调音台 | 配方是纯数据：调参、试听、把代码复制进项目，中间没有任何音频文件 -->
<script setup lang="ts">
import type { OscillatorLayer, SoundSpec } from "@xihan-ui/sound";
import { createSoundPlayer, glide, strike } from "@xihan-ui/sound";
import {
  XhButton,
  XhRadioGroupRoot,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
import { computed, onBeforeUnmount, reactive, ref } from "vue";

const waves = [
  { value: "sine", label: "sine" },
  { value: "triangle", label: "triangle" },
  { value: "square", label: "square" },
  { value: "sawtooth", label: "sawtooth" },
];

type Param = "from" | "to" | "attack" | "decay" | "peak" | "space";

// 六个参数各一条滑块：标签、单位与取值范围
const knobs: { key: Param; label: string; unit: string; min: number; max: number; step: number }[] = [
  { key: "from", label: "起始", unit: "Hz", min: 80, max: 2400, step: 10 },
  { key: "to", label: "终止", unit: "Hz", min: 80, max: 2400, step: 10 },
  { key: "attack", label: "起音", unit: "ms", min: 1, max: 80, step: 1 },
  { key: "decay", label: "衰减", unit: "ms", min: 20, max: 900, step: 10 },
  { key: "peak", label: "峰值", unit: "", min: 0.05, max: 0.6, step: 0.05 },
  { key: "space", label: "空间", unit: "", min: 0, max: 0.6, step: 0.05 },
];

const wave = ref<OscillatorLayer["wave"]>("triangle");
// 滑块的值恒为数组，单滑块只有一项
const params = reactive<Record<Param, [number]>>({
  from: [880],
  to: [1320],
  attack: [5],
  decay: [180],
  peak: [0.3],
  space: [0.15],
});

const seconds = computed(() => Math.max(0.01, params.decay[0] / 1000));

const spec = computed<SoundSpec>(() => ({
  layers: [
    {
      kind: "oscillator",
      wave: wave.value,
      frequency: glide(params.from[0], params.to[0], seconds.value),
      gain: strike(params.peak[0], params.attack[0] / 1000, seconds.value),
    },
  ],
  space: params.space[0],
}));

const code = computed(
  () => \`sound.play({
  layers: [
    {
      kind: 'oscillator',
      wave: '\${wave.value}',
      frequency: glide(\${params.from[0]}, \${params.to[0]}, \${seconds.value.toFixed(3)}),
      gain: strike(\${params.peak[0]}, \${(params.attack[0] / 1000).toFixed(3)}, \${seconds.value.toFixed(3)}),
    },
  ],
  space: \${params.space[0]},
})\`,
);

const player = createSoundPlayer();
onBeforeUnmount(() => player.dispose());
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <XhRadioGroupRoot v-model:value="wave" :collection="waves" label="波形" name="sound-wave" />

    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 10px 20px;
      "
    >
      <XhSliderRoot
        v-for="knob in knobs"
        :key="knob.key"
        :value="params[knob.key]"
        :min="knob.min"
        :max="knob.max"
        :step="knob.step"
        @update:value="params[knob.key] = $event as [number]"
      >
        <XhSliderLabel>{{ knob.label }} {{ params[knob.key][0] }}{{ knob.unit }}</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb />
        </XhSliderControl>
      </XhSliderRoot>
    </div>

    <div>
      <XhButton variant="solid" @click="player.play(spec)">试听</XhButton>
    </div>

    <pre
      data-xh-scroll
      style="
        margin: 0;
        padding: 12px 14px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
        font-size: 12px;
        line-height: 1.6;
        overflow-x: auto;
      "
    >{{ code }}</pre>
  </div>
</template>
`;export{e as default};