const t=`<!-- 线性模式 | linear 下还没走到的步一律禁用，只能回头看走过的；它只拦界面上的乱跳，逐步前进照常 -->
<script setup lang="ts">
import {
  XhButton,
  XhStepsContent,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = ["实名认证", "绑定银行卡", "签署协议"];
<\/script>

<template>
  <XhStepsRoot
    v-slot="{ step, complete, goToPrevStep, goToNextStep }"
    :count="steps.length"
    linear
    style="inline-size: 100%"
  >
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ step > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s }}</XhStepsTitle>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">面板 1：上传证件照。</XhStepsContent>
    <XhStepsContent :value="1">面板 2：填写卡号。</XhStepsContent>
    <XhStepsContent :value="2">面板 3：勾选并签署。</XhStepsContent>
    <XhStepsContent :value="steps.length">全部完成。</XhStepsContent>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" :disabled="step === 0" @click="goToPrevStep()">
        上一步
      </XhButton>
      <XhButton variant="solid" :disabled="complete" @click="goToNextStep()">
        下一步
      </XhButton>
    </div>
  </XhStepsRoot>
</template>
`;export{t as default};
