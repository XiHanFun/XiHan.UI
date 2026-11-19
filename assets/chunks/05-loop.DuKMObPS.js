var e=`<!-- 循环 | loop 一直响到 stop：来电 ring 与回铃 ringback 各按配方的周期续上，按一下开始、再按一下停下 -->
<script setup lang="ts">
import type { SoundLoop } from "@xihan-ui/sound";
import { createSoundPlayer } from "@xihan-ui/sound";
import { XhButton } from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

const names = ["ring", "ringback"] as const;

const player = createSoundPlayer();
const playing = ref<string | null>(null);
let current: SoundLoop | null = null;

function toggle(name: string): void {
  current?.stop();
  current = null;
  if (playing.value === name) {
    playing.value = null;
    return;
  }
  current = player.loop(name);
  playing.value = name;
}

onBeforeUnmount(() => player.dispose());
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhButton
      v-for="name in names"
      :key="name"
      :variant="playing === name ? 'solid' : 'outline'"
      :aria-pressed="playing === name"
      @click="toggle(name)"
    >
      {{ playing === name ? \`停下 \${name}\` : name }}
    </XhButton>
  </div>
</template>
`;export{e as default};