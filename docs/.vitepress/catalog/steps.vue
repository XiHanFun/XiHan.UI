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

const steps = ["填写信息", "完成"];
</script>

<template>
  <XhStepsRoot :count="steps.length" :default-value="1">
    <XhStepsList>
      <XhStepsItem v-for="(step, index) in steps" :key="step" :value="index">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ index + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ step }}</XhStepsTitle>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>
  </XhStepsRoot>
</template>
