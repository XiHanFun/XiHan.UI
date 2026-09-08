const n=`<!-- 按步定制正文 | 标题与说明之外，正文按当前步的 id 换成自己的一块内容；showBackdrop 关掉那层压暗，引导与页面一起看 -->
<script setup lang="ts">
import {
  XhButton,
  XhTourArrow,
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
    target: "#tour-per-step-search",
    title: "全站搜索",
    description: "按名称或编号找记录。",
  },
  {
    id: "filter",
    target: "#tour-per-step-filter",
    title: "筛选",
    description: "条件会记在本地，下次进来还在。",
  },
  {
    id: "export",
    target: "#tour-per-step-export",
    title: "导出",
    description: "导出当前筛选后的全部数据。",
  },
];

// 各步自己的那块正文：键就是 steps 里的 id
const tips: Record<string, string[]> = {
  search: ["支持拼音首字母", "编号可以只输后六位"],
  filter: ["状态与时间区间可以叠加", "清空条件用一次「重置」"],
  export: ["走后台队列，导完站内信通知", "单次上限十万行"],
};

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => \`第 \${step} 步，共 \${count} 步\`,
};

const panel = "padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px";
<\/script>

<template>
  <XhTourRoot
    v-slot="{ setOpen, lastStep, currentStep }"
    :steps="steps"
    :show-backdrop="false"
    :translations="translations"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div id="tour-per-step-search" :style="panel">搜索</div>
        <div id="tour-per-step-filter" :style="panel">筛选</div>
        <div id="tour-per-step-export" :style="panel">导出</div>
      </div>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
    </div>

    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <!-- 按当前步换的那一块：标题与说明照旧由组件按 steps 填 -->
        <ul v-if="currentStep" style="margin: 0; padding-inline-start: 18px">
          <li v-for="tip in tips[currentStep.id] ?? []" :key="tip">{{ tip }}</li>
        </ul>
        <XhTourProgressText />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>{{ lastStep ? "完成" : "下一步" }}</XhTourNextTrigger>
          <XhTourSkipTrigger>跳过</XhTourSkipTrigger>
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
`;export{n as default};
