const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 禁用 | 保留禁用前的状态 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
<\/script>

<template>
  <XhToggle disabled><XhIcon :icon="HeartIcon" />点赞</XhToggle>
  <XhToggle disabled default-pressed><XhIcon :icon="HeartIcon" />点赞</XhToggle>
</template>
`;export{n as default};
