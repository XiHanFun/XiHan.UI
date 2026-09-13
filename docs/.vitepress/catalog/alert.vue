<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 alert 相关实现。 -->

<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhAlertContent,
  XhAlertDescription,
  XhAlertIndicator,
  XhAlertRoot,
  XhAlertTitle,
  XhIcon,
} from "@xihan-ui/vue";
</script>

<template>
  <XhAlertRoot tone="success" style="inline-size: 240px">
    <XhAlertIndicator><XhIcon :icon="CheckIcon" /></XhAlertIndicator>
    <XhAlertContent>
      <XhAlertTitle>保存成功</XhAlertTitle>
      <XhAlertDescription>更改已经生效。</XhAlertDescription>
    </XhAlertContent>
  </XhAlertRoot>
</template>
