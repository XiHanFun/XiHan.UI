<!-- 受控 | 传了 open 与 value 就由宿主说了算：内部不再自改，只发意图，浮层里的按钮与外面的进度读的是同一份状态 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTourArrow,
  XhTourBackdrop,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  {
    id: "list",
    target: "#tour-controlled-list",
    title: "列表",
    description: "记录都在这里。",
  },
  {
    id: "detail",
    target: "#tour-controlled-detail",
    title: "详情",
    description: "选中一条后在这块看明细。",
  },
  {
    id: "actions",
    target: "#tour-controlled-actions",
    title: "操作",
    description: "批量动作收在这一栏。",
  },
];

const open = ref(false);
const step = ref(0);
const log = ref("（未开始）");

const panel =
  "padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px";

function start(from: number): void {
  step.value = from;
  open.value = true;
}

function onComplete(details: { step: number }): void {
  log.value = `走完了第 ${details.step + 1} 步`;
}

function onSkip(details: { step: number }): void {
  log.value = `在第 ${details.step + 1} 步放弃`;
}
</script>

<template>
  <XhTourRoot
    v-model:open="open"
    v-model:value="step"
    :steps="steps"
    @complete="onComplete"
    @skip="onSkip"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div id="tour-controlled-list" :style="panel">列表</div>
        <div id="tour-controlled-detail" :style="panel">详情</div>
        <div id="tour-controlled-actions" :style="panel">操作</div>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <XhButton variant="solid" @click="start(0)">从头开始</XhButton>
        <XhButton variant="outline" @click="start(2)">直接跳到第 3 步</XhButton>
        <span style="font-size: 13px; opacity: 0.75">
          open={{ open }} · value={{ step }} · {{ log }}
        </span>
      </div>
    </div>

    <XhTourBackdrop />
    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>下一步</XhTourNextTrigger>
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
