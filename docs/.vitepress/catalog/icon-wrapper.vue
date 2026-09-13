<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 icon wrapper 相关实现。 -->

<script setup lang="ts">
import { BellIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";
</script>

<template>
  <XhIconWrapper>
    <XhIcon :icon="BellIcon" />
  </XhIconWrapper>
</template>
