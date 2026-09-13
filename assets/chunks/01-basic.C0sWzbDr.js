const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 切换点赞状态 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
<\/script>

<template>
  <XhToggle>
    <XhIcon :icon="HeartIcon" />
    点赞
  </XhToggle>
</template>
`;export{n as default};
