<!-- 基础用法 | 展示流程进度与当前步骤内容 -->
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
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];
</script>

<template>
  <XhStepsRoot v-slot="{ value }" :count="steps.length" :default-value="1">
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

    <XhStepsContent :value="0">填写收货人与联系方式。</XhStepsContent>
    <XhStepsContent :value="1">选择支付方式并确认优惠信息。</XhStepsContent>
    <XhStepsContent :value="2">核对订单金额后提交。</XhStepsContent>
    <XhStepsContent :value="steps.length">订单已提交。</XhStepsContent>
  </XhStepsRoot>
</template>
