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
  <XhAlertRoot tone="success" style="inline-size: var(--xh-doc-catalog-w)">
    <XhAlertIndicator><XhIcon :icon="CheckIcon" /></XhAlertIndicator>
    <XhAlertContent>
      <XhAlertTitle>保存成功</XhAlertTitle>
      <XhAlertDescription>更改已经生效。</XhAlertDescription>
    </XhAlertContent>
  </XhAlertRoot>
</template>
