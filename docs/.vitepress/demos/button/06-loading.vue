<!-- 加载 | 保留按钮标签并阻止重复操作 -->
<script setup lang="ts">
import { LoaderIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonIndicator, XhButtonLabel, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhButton loading>
    <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
    <XhButtonLabel>提交</XhButtonLabel>
  </XhButton>
  <XhButton loading variant="subtle">
    <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
    <XhButtonLabel>处理中</XhButtonLabel>
  </XhButton>
</template>
