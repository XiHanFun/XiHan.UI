var e=`<!-- 错开起播 | 一组元素依次进场，起点可以从头、从尾或从中间；文字拆开即为一组元素 -->
<script setup lang="ts">
import type { StaggerFrom } from "@xihan-ui/animations";
import { createMotionPlayer, splitText } from "@xihan-ui/animations";
import {
  XhButton,
  XhRadioGroupRoot,
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref, useTemplateRef } from "vue";

const fromOptions = [
  { value: "first", label: "从头" },
  { value: "last", label: "从尾" },
  { value: "center", label: "从中间" },
];

const motion = createMotionPlayer();
const list = useTemplateRef<HTMLElement>("list");
const title = useTemplateRef<HTMLElement>("title");
const from = ref<StaggerFrom>("first");
// 滑块的值恒为数组，单滑块即长度 1
const gap = ref([60]);

function playList() {
  const el = list.value;
  if (!el)
    return;
  void motion.playAll([...el.children] as HTMLElement[], "rise", {
    stagger: gap.value[0],
    from: from.value,
  });
}

async function playTitle() {
  const el = title.value;
  if (!el)
    return;
  const { parts, restore } = splitText(el);
  await motion.playAll(parts, "fade-up", { stagger: 30 });
  restore();
}

onBeforeUnmount(() => motion.cancel());
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-4); width: 100%">
    <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-5)">
      <XhRadioGroupRoot
        v-model:value="from"
        :collection="fromOptions"
        label="起点"
        name="stagger-from"
      />
      <XhSliderRoot v-model:value="gap" :min="0" :max="200" :step="10" style="inline-size: var(--xh-control-w)">
        <XhSliderLabel>间隔 {{ gap[0] }}ms</XhSliderLabel>
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

    <div style="display: flex; gap: var(--xh-space-2)">
      <XhButton size="sm" @click="playList">播列表</XhButton>
      <XhButton size="sm" variant="outline" @click="playTitle">播标题</XhButton>
    </div>

    <h3 ref="title" style="margin: 0; font-size: var(--xh-font-size-2xl)">曦寒 UI 动画层</h3>

    <div ref="list" style="display: flex; flex-wrap: wrap; gap: var(--xh-space-2)">
      <div
        v-for="n in 8"
        :key="n"
        style="
          display: grid;
          place-items: center;
          width: calc(2 * var(--xh-space-6));
          height: calc(2 * var(--xh-space-6));
          border-radius: var(--xh-shape-surface);
          background: var(--xh-bg-subtle);
          font-weight: var(--xh-font-weight-semibold);
        "
      >
        {{ n }}
      </div>
    </div>
  </div>
</template>
`;export{e as default};