var e=`<!-- 只读展示 | 只呈现进度：步骤不可点、不可聚焦，也不置灰 -->
<script setup lang="ts">
import {
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
  { title: "已下单", description: "09-26 10:12" },
  { title: "已发货", description: "09-26 16:40" },
  { title: "运输中", description: "预计明日送达" },
  { title: "已签收", description: "" },
];
<\/script>

<template>
  <XhStepsRoot :count="steps.length" :value="2" read-only :translations="{ list: '物流进度' }">
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ i < 2 ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription v-if="s.description">{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>
  </XhStepsRoot>
</template>
`;export{e as default};