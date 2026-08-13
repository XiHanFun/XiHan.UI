<!-- 调音台 | 配方是纯数据：调参、试听、把代码抄进项目，中间没有任何音频文件 -->
<script setup lang="ts">
import type { OscillatorLayer, SoundSpec } from "@xihan-ui/sound";
import { computed, onBeforeUnmount, ref } from "vue";
import { createSoundPlayer, glide, strike } from "@xihan-ui/sound";
import { XhButton, XhRadioGroupRoot } from "@xihan-ui/vue";

const waves = [
  { value: "sine", label: "sine" },
  { value: "triangle", label: "triangle" },
  { value: "square", label: "square" },
  { value: "sawtooth", label: "sawtooth" },
];

const wave = ref<OscillatorLayer["wave"]>("triangle");
const from = ref(880);
const to = ref(1320);
const attack = ref(5);
const decay = ref(180);
const peak = ref(0.3);
const space = ref(0.15);

const seconds = computed(() => Math.max(0.01, decay.value / 1000));

const spec = computed<SoundSpec>(() => ({
  layers: [
    {
      kind: "oscillator",
      wave: wave.value,
      frequency: glide(from.value, to.value, seconds.value),
      gain: strike(peak.value, attack.value / 1000, seconds.value),
    },
  ],
  space: space.value,
}));

const code = computed(
  () => `sound.play({
  layers: [
    {
      kind: 'oscillator',
      wave: '${wave.value}',
      frequency: glide(${from.value}, ${to.value}, ${seconds.value.toFixed(3)}),
      gain: strike(${peak.value}, ${(attack.value / 1000).toFixed(3)}, ${seconds.value.toFixed(3)}),
    },
  ],
  space: ${space.value},
})`,
);

const player = createSoundPlayer();
onBeforeUnmount(() => player.dispose());
</script>

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
      <label style="display: flex; align-items: center; gap: 8px">
        <span style="width: 76px">起始 {{ from }}Hz</span>
        <input v-model.number="from" type="range" min="80" max="2400" step="10" />
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        <span style="width: 76px">终止 {{ to }}Hz</span>
        <input v-model.number="to" type="range" min="80" max="2400" step="10" />
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        <span style="width: 76px">起音 {{ attack }}ms</span>
        <input v-model.number="attack" type="range" min="1" max="80" step="1" />
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        <span style="width: 76px">衰减 {{ decay }}ms</span>
        <input v-model.number="decay" type="range" min="20" max="900" step="10" />
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        <span style="width: 76px">峰值 {{ peak }}</span>
        <input v-model.number="peak" type="range" min="0.05" max="0.6" step="0.05" />
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        <span style="width: 76px">空间 {{ space }}</span>
        <input v-model.number="space" type="range" min="0" max="0.6" step="0.05" />
      </label>
    </div>

    <div>
      <XhButton variant="solid" @click="player.play(spec)">试听</XhButton>
    </div>

    <pre
      style="
        margin: 0;
        padding: 12px 14px;
        border-radius: 8px;
        background: var(--vp-c-bg-soft);
        font-size: 12px;
        line-height: 1.6;
        overflow-x: auto;
      "
    >{{ code }}</pre>
  </div>
</template>
