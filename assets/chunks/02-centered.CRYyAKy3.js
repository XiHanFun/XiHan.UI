const n=`<!-- 居中步 | 不写 target 的那一步不锚定任何元素：浮层居中、不画高亮框、也不出箭头，适合当开场白与收尾 -->
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
    id: "welcome",
    title: "欢迎",
    description: "这一步没有 target，浮层落在屏幕正中。",
  },
  {
    id: "inbox",
    target: "#tour-centered-inbox",
    title: "收件箱",
    description: "锚定到元素上，箭头与高亮框一并出现。",
  },
  {
    id: "done",
    title: "就这些",
    description: "最后一步同样不锚定，收个尾。",
  },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => \`第 \${step} 步，共 \${count} 步\`,
};
<\/script>

<template>
  <XhTourRoot
    v-slot="{ setOpen, lastStep, currentStep }"
    :steps="steps"
    :spotlight-padding="12"
    :translations="translations"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div
        id="tour-centered-inbox"
        style="
          padding: 8px 14px;
          border: 1px solid var(--vp-c-divider);
          border-radius: 8px;
        "
      >
        收件箱
      </div>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
      <span style="font-size: 13px; opacity: 0.75">
        当前步：{{ currentStep ? currentStep.id : "（未开始）" }}
      </span>
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
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
`;export{n as default};
