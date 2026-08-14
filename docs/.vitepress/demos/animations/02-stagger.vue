<!-- 错开起播 | 一组元素依次进场，起点可以从头、从尾或从中间；文字拆开就是一组元素 -->
<script setup lang="ts">
import type { StaggerFrom } from "@xihan-ui/animations";
import { onBeforeUnmount, ref, useTemplateRef } from "vue";
import { createMotionPlayer, splitText } from "@xihan-ui/animations";
import { XhButton, XhRadioGroupRoot } from "@xihan-ui/vue";

const fromOptions = [
  { value: "first", label: "从头" },
  { value: "last", label: "从尾" },
  { value: "center", label: "从中间" },
];

const motion = createMotionPlayer();
const list = useTemplateRef<HTMLElement>("list");
const title = useTemplateRef<HTMLElement>("title");
const from = ref<StaggerFrom>("first");
const gap = ref(60);

function playList() {
  const el = list.value;
  if (!el) return;
  void motion.playAll([...el.children] as HTMLElement[], "rise", {
    stagger: gap.value,
    from: from.value,
  });
}

async function playTitle() {
  const el = title.value;
  if (!el) return;
  const { parts, restore } = splitText(el);
  await motion.playAll(parts, "fade-up", { stagger: 30 });
  restore();
}

onBeforeUnmount(() => motion.cancel());
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px">
      <XhRadioGroupRoot
        v-model:value="from"
        :collection="fromOptions"
        label="起点"
        name="stagger-from"
      />
      <label style="display: flex; align-items: center; gap: 8px">
        间隔 {{ gap }}ms
        <input v-model.number="gap" type="range" min="0" max="200" step="10" />
      </label>
    </div>

    <div style="display: flex; gap: 8px">
      <XhButton size="sm" @click="playList">播列表</XhButton>
      <XhButton size="sm" variant="outline" @click="playTitle">播标题</XhButton>
    </div>

    <h3 ref="title" style="margin: 0; font-size: 24px">曦寒 UI 动画层</h3>

    <div ref="list" style="display: flex; flex-wrap: wrap; gap: 8px">
      <div
        v-for="n in 8"
        :key="n"
        style="
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: var(--vp-c-brand-soft);
          font-weight: 600;
        "
      >
        {{ n }}
      </div>
    </div>
  </div>
</template>
