const t=`<!-- 定位 | 为每一步选择合适的浮层方向 -->
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
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  { id: "left", target: "#tour-placement-left", title: "左侧入口", description: "浮层显示在目标下方。", placement: "bottom-start" as const },
  { id: "center", target: "#tour-placement-center", title: "中间入口", description: "浮层显示在目标上方。", placement: "top" as const },
  { id: "right", target: "#tour-placement-right", title: "右侧入口", description: "浮层显示在目标左侧。", placement: "left" as const },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => \`第 \${step} 步，共 \${count} 步\`,
};
<\/script>

<template>
  <XhTourRoot v-slot="{ setOpen, lastStep }" :steps="steps" :translations="translations">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton id="tour-placement-left" variant="outline">左侧</XhButton>
      <XhButton id="tour-placement-center" variant="outline">中间</XhButton>
      <XhButton id="tour-placement-right" variant="outline">右侧</XhButton>
      <XhButton variant="solid" @click="setOpen(true)">查看定位</XhButton>
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
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
`;export{t as default};
