var e=`<!-- 当前步进度 | 用 percent 在当前步的圆点外画一圈进度环，报出这一步自己完成了多少 -->
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
  { title: "选择文件", description: "共 12 个" },
  { title: "上传", description: "已传 7 个" },
  { title: "校验", description: "等待中" },
];
<\/script>

<template>
  <XhStepsRoot v-slot="{ value }" :count="steps.length" :default-value="1" :percent="60">
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ value > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>
  </XhStepsRoot>
</template>
`;export{e as default};