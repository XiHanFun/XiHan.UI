const t=`<!-- 点状形态 | 步数多或横向空间紧时，圆点收成不盛内容的小点，只标位置 -->
<script setup lang="ts">
import {
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = ["提交申请", "资料初审", "现场核验", "复审公示", "发放证照"];
<\/script>

<template>
  <XhStepsRoot variant="dot" :count="steps.length" :default-value="2">
    <XhStepsList>
      <XhStepsItem v-for="(title, i) in steps" :key="title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator />
          <XhStepsTitle>{{ title }}</XhStepsTitle>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>
  </XhStepsRoot>
</template>
`;export{t as default};
