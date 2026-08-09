<!-- 基础用法 | steps 是唯一事实源，组件只按下标取用；每步的 target 是一个 CSS 选择器，高亮框与浮层都锚在它上面 -->
<script setup lang="ts">
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
  XhTourProgressText,
  XhTourRoot,
  XhTourSkipTrigger,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  {
    id: "search",
    target: "#tour-basic-search",
    title: "全站搜索",
    description: "按名称或编号找记录，支持拼音首字母。",
    placement: "bottom" as const,
  },
  {
    id: "filter",
    target: "#tour-basic-filter",
    title: "筛选",
    description: "按状态与时间区间收窄结果，条件会记在本地。",
    placement: "bottom" as const,
  },
  {
    id: "export",
    target: "#tour-basic-export",
    title: "导出",
    description: "导出当前筛选后的全部数据，走后台队列。",
    placement: "bottom-end" as const,
  },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};

const panel =
  "padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px";
</script>

<template>
  <XhTourRoot
    v-slot="{ setOpen, lastStep }"
    :steps="steps"
    :translations="translations"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div id="tour-basic-search" :style="panel">搜索</div>
        <div id="tour-basic-filter" :style="panel">筛选</div>
        <div id="tour-basic-export" :style="panel">导出</div>
      </div>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
    </div>

    <XhTourBackdrop />
    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <XhTourProgressText />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>{{ lastStep ? "完成" : "下一步" }}</XhTourNextTrigger>
          <XhTourSkipTrigger>跳过</XhTourSkipTrigger>
        </div>
        <XhTourCloseTrigger>✕</XhTourCloseTrigger>
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
