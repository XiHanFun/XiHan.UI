var e=`<!-- 预设一览 | 十七个内置预设，进场一族从不在场进入，注意一族原地提醒；播完都回到静息态 -->
<script setup lang="ts">
import { BUILTIN_MOTION_NAMES, createMotionPlayer } from "@xihan-ui/animations";
import { XhButton } from "@xihan-ui/vue";
import { onBeforeUnmount, ref, useTemplateRef } from "vue";

const enter = BUILTIN_MOTION_NAMES.slice(0, 11);
const attention = BUILTIN_MOTION_NAMES.slice(11);

const motion = createMotionPlayer();
const card = useTemplateRef<HTMLElement>("card");
const last = ref("");

function play(name: string) {
  const el = card.value;
  if (!el)
    return;
  last.value = name;
  void motion.play(el, name);
}

onBeforeUnmount(() => motion.cancel());
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-4); width: 100%">
    <div
      style="
        display: grid;
        place-items: center;
        min-height: 140px;
        border: var(--xh-stroke-thin) dashed var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
      "
    >
      <div
        ref="card"
        style="
          padding: var(--xh-space-4) var(--xh-space-6);
          border-radius: var(--xh-shape-surface);
          background: var(--xh-bg-brand);
          color: var(--xh-fg-on-brand);
          font-weight: var(--xh-font-weight-semibold);
        "
      >
        {{ last || "点下面的名字" }}
      </div>
    </div>

    <div>
      <p style="margin: 0 0 var(--xh-space-2); font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">进场</p>
      <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-2)">
        <XhButton
          v-for="name in enter"
          :key="name"
          variant="outline"
          size="sm"
          @click="play(name)"
        >
          {{ name }}
        </XhButton>
      </div>
    </div>

    <div>
      <p style="margin: 0 0 var(--xh-space-2); font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">注意</p>
      <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-2)">
        <XhButton
          v-for="name in attention"
          :key="name"
          variant="outline"
          size="sm"
          @click="play(name)"
        >
          {{ name }}
        </XhButton>
      </div>
    </div>
  </div>
</template>
`;export{e as default};