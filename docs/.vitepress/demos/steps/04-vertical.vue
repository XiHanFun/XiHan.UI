<!-- 竖排 | orientation="vertical" 把步骤列与面板并排摆，方向键随之改收上下键 -->
<script setup lang="ts">
import {
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
  { title: "打包", description: "生成产物" },
  { title: "测试", description: "跑单元测试" },
  { title: "发布", description: "推到镜像仓库" },
];
</script>

<template>
  <XhStepsRoot
    :count="steps.length"
    :default-step="1"
    orientation="vertical"
    style="inline-size: 100%"
  >
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">面板 1：打包日志。</XhStepsContent>
    <XhStepsContent :value="1">面板 2：测试报告。</XhStepsContent>
    <XhStepsContent :value="2">面板 3：发布记录。</XhStepsContent>
    <XhStepsContent :value="steps.length">流水线跑完了。</XhStepsContent>
  </XhStepsRoot>
</template>
