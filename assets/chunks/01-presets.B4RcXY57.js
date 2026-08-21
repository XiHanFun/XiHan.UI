const n=`<!-- 预设一览 | 十七个内置预设，进场一族从不在场进来，注意一族原地提醒；播完都回到静息态 -->
<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef } from "vue";
import { BUILTIN_MOTION_NAMES, createMotionPlayer } from "@xihan-ui/animations";
import { XhButton } from "@xihan-ui/vue";

const enter = BUILTIN_MOTION_NAMES.slice(0, 11);
const attention = BUILTIN_MOTION_NAMES.slice(11);

const motion = createMotionPlayer();
const card = useTemplateRef<HTMLElement>("card");
const last = ref("");

function play(name: string) {
  const el = card.value;
  if (!el) return;
  last.value = name;
  void motion.play(el, name);
}

onBeforeUnmount(() => motion.cancel());
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <div
      style="
        display: grid;
        place-items: center;
        min-height: 140px;
        border: 1px dashed var(--vp-c-divider);
        border-radius: 12px;
      "
    >
      <div
        ref="card"
        style="
          padding: 16px 24px;
          border-radius: 10px;
          background: var(--vp-c-brand-1);
          color: #fff;
          font-weight: 600;
        "
      >
        {{ last || "点下面的名字" }}
      </div>
    </div>

    <div>
      <p style="margin: 0 0 8px; font-size: 13px; opacity: 0.7">进场</p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
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
      <p style="margin: 0 0 8px; font-size: 13px; opacity: 0.7">注意</p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
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
`;export{n as default};
