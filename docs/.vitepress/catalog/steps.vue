<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 steps 相关实现。 -->

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

const steps = ["填写信息", "确认内容", "完成"];
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
