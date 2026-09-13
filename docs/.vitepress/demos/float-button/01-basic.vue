<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 展开一组悬浮操作 -->
<script setup lang="ts">
import { MessageCircleIcon, SettingsIcon, ShareIcon } from "@xihan-ui/icons";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhFloatButtonRoot style="position: static" default-open>
    <XhFloatButtonTrigger />
    <XhFloatButtonList>
      <button type="button" aria-label="消息"><XhIcon :icon="MessageCircleIcon" /></button>
      <button type="button" aria-label="分享"><XhIcon :icon="ShareIcon" /></button>
      <button type="button" aria-label="设置"><XhIcon :icon="SettingsIcon" /></button>
    </XhFloatButtonList>
  </XhFloatButtonRoot>
</template>
