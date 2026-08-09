<!-- 基础用法 | 不传 step 即为非受控；方向键只搬焦点，按 Enter 或空格才切步，进退方法由 root 的插槽交出来 -->
<script setup lang="ts">
import {
  XhButton,
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
  <XhStepsRoot
    v-slot="{ step, count, complete, goToPrevStep, goToNextStep }"
    :count="steps.length"
    style="inline-size: 100%"
  >
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <!-- 圆点里的字符是作者内容：皮肤只按 data-state 管描边与填充 -->
          <XhStepsIndicator>{{ step > i ? "✓" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">面板 1：填写收货地址。</XhStepsContent>
    <XhStepsContent :value="1">面板 2：选择支付方式。</XhStepsContent>
    <XhStepsContent :value="2">面板 3：核对金额并提交。</XhStepsContent>
    <!-- value 等于 count 的这块是完成页：走完最后一步之后的那一格 -->
    <XhStepsContent :value="steps.length">全部完成：订单已提交。</XhStepsContent>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" :disabled="step === 0" @click="goToPrevStep()">
        上一步
      </XhButton>
      <XhButton variant="solid" :disabled="complete" @click="goToNextStep()">
        下一步
      </XhButton>
      <span>{{ complete ? "当前：全部完成" : `当前：第 ${step + 1} / ${count} 步` }}</span>
    </div>
  </XhStepsRoot>
</template>
