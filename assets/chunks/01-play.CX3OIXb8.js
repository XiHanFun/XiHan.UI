const e=`<!-- 试听 | 十四个语义名，切主题听同一件事的三种说法；音量与开关直接落在播放器上 -->
<script setup lang="ts">
import type { SoundTheme } from "@xihan-ui/sound";
import { onBeforeUnmount, ref, watch } from "vue";
import {
  BUILTIN_SOUND_NAMES,
  createSoundPlayer,
  defaultSoundTheme,
  minimalSoundTheme,
  softSoundTheme,
} from "@xihan-ui/sound";
import { XhButton, XhRadioGroupRoot, XhSwitch } from "@xihan-ui/vue";

const themes: Record<string, SoundTheme> = {
  default: defaultSoundTheme,
  minimal: minimalSoundTheme,
  soft: softSoundTheme,
};

const options = [
  { value: "default", label: "default 清亮" },
  { value: "minimal", label: "minimal 极简" },
  { value: "soft", label: "soft 柔和" },
];

// 建播放器不碰音频上下文，等第一次真的发声才建，放 setup 里是安全的
const player = createSoundPlayer();
const theme = ref("default");
const volume = ref(0.5);
const enabled = ref(true);

watch(theme, (name) => player.setTheme(themes[name] ?? defaultSoundTheme));
watch(volume, (value) => player.setVolume(value));
watch(enabled, (on) => player.setEnabled(on));

onBeforeUnmount(() => player.dispose());
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px">
      <XhRadioGroupRoot
        v-model:value="theme"
        :collection="options"
        label="主题"
        name="sound-theme"
      />
      <label style="display: flex; align-items: center; gap: 8px">
        音量
        <input v-model.number="volume" type="range" min="0" max="1" step="0.05" />
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        出声
        <XhSwitch v-model:checked="enabled" />
      </label>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton
        v-for="name in BUILTIN_SOUND_NAMES"
        :key="name"
        variant="outline"
        size="sm"
        @click="player.play(name)"
      >
        {{ name }}
      </XhButton>
    </div>
  </div>
</template>
`;export{e as default};
