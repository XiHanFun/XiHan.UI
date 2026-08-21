const t=`<!-- 语气 | tone 决定已完成与当前这两步的标记、连接线用哪族颜色；示例预置到第 2 步，第 1 步已走完 -->
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const steps = [
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="t in tones" :key="t">
      <div style="margin-block-end: 8px; font-size: 12px">{{ t }}</div>
      <XhStepsRoot
        :tone="t"
        :count="steps.length"
        :default-step="1"
        style="inline-size: 100%"
      >
        <XhStepsList>
          <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
            <XhStepsTrigger>
              <XhStepsIndicator>{{ i === 0 ? "✓" : i + 1 }}</XhStepsIndicator>
              <XhStepsTitle>{{ s.title }}</XhStepsTitle>
              <XhStepsDescription>{{ s.description }}</XhStepsDescription>
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        </XhStepsList>

        <XhStepsContent v-for="(s, i) in steps" :key="s.title" :value="i">
          面板 {{ i + 1 }}：{{ s.title }}
        </XhStepsContent>
        <XhStepsContent :value="steps.length">全部完成。</XhStepsContent>
      </XhStepsRoot>
    </div>
  </div>
</template>
`;export{t as default};
