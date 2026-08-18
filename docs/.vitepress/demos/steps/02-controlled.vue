<!-- 受控 | 传了 step 就由宿主说了算，组件自己不再改步序；切步意图从 step-change 出来，写回才真的切 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = ["提交申请", "主管审批", "财务复核", "归档"];
const current = ref(1);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhStepsRoot v-model:step="current" :count="steps.length">
      <XhStepsList>
        <XhStepsItem v-for="(s, i) in steps" :key="s" :value="i">
          <XhStepsTrigger>
            <XhStepsIndicator>{{ current > i ? "✓" : i + 1 }}</XhStepsIndicator>
            <XhStepsTitle>{{ s }}</XhStepsTitle>
          </XhStepsTrigger>
          <XhStepsSeparator />
        </XhStepsItem>
      </XhStepsList>
    </XhStepsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" @click="current = 0">回到第一步</XhButton>
      <XhButton variant="outline" @click="current = steps.length">直接完成</XhButton>
      <span>当前 step：{{ current }}</span>
    </div>
  </div>
</template>
