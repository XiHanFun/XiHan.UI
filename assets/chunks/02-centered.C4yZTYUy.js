const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 居中步骤 | 用于引导的开场与结束 -->
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
    v-slot="{ setOpen, lastStep }"
    :steps="steps"
    :spotlight-padding="12"
    :translations="translations"
  >
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton id="tour-centered-inbox" variant="outline">收件箱</XhButton>
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
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
`;export{n as default};
