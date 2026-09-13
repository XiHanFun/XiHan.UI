const t=`<!-- 错误状态 | 标记需要用户处理的步骤 -->
<script setup lang="ts">
import { XIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhStepsContent,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = [
  { title: "提交材料", description: "已通过" },
  { title: "资质审核", description: "材料不齐，被打回" },
  { title: "签署合同", description: "等待中" },
];

const errorAt = 1;
<\/script>

<template>
  <XhStepsRoot v-slot="{ value }" :count="steps.length" :default-value="1" :statuses="{ [errorAt]: 'error' }">
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>
            <XhIcon v-if="i === errorAt" :icon="XIcon" />
            <template v-else>{{ value > i ? "" : i + 1 }}</template>
          </XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">材料已提交。</XhStepsContent>
    <XhStepsContent :value="1">请补充营业执照副本。</XhStepsContent>
    <XhStepsContent :value="2">等待签署合同。</XhStepsContent>
    <XhStepsContent :value="steps.length">流程已完成。</XhStepsContent>
  </XhStepsRoot>
</template>
`;export{t as default};
