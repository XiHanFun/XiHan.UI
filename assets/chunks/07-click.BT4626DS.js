const t=`<!-- 点击切步与禁用某步 | 点标签直接切到那一步；单步标了 disabled 就点不动，方向键也跳过它 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhStepsContent,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = [
  { title: "选择商品", disabled: false },
  { title: "确认订单", disabled: false },
  { title: "在线支付", disabled: true },
  { title: "等待发货", disabled: false },
];
const current = ref(0);
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhStepsRoot v-model:step="current" :count="steps.length">
      <XhStepsList>
        <XhStepsItem
          v-for="(s, i) in steps"
          :key="s.title"
          :value="i"
          :disabled="s.disabled"
        >
          <XhStepsTrigger>
            <XhStepsIndicator>{{ current > i ? "✓" : i + 1 }}</XhStepsIndicator>
            <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          </XhStepsTrigger>
          <XhStepsSeparator />
        </XhStepsItem>
      </XhStepsList>

      <XhStepsContent v-for="(s, i) in steps" :key="s.title" :value="i">
        面板 {{ i + 1 }}：{{ s.title }}
      </XhStepsContent>
      <XhStepsContent :value="steps.length">全部完成。</XhStepsContent>
    </XhStepsRoot>

    <span>当前 step：{{ current }}（第三步禁用，点它没有反应）</span>
  </div>
</template>
`;export{t as default};
