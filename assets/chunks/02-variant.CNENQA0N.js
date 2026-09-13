const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | 默认与幽灵外观 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
<\/script>

<template>
  <XhToggle default-pressed><XhIcon :icon="HeartIcon" />默认</XhToggle>
  <XhToggle variant="ghost"><XhIcon :icon="HeartIcon" />幽灵</XhToggle>
</template>
`;export{n as default};
