<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 受控状态 | 由外部状态控制按下值 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
import { ref } from "vue";

const pressed = ref(false);
</script>

<template>
  <XhToggle v-model:pressed="pressed">
    <XhIcon :icon="HeartIcon" />
    {{ pressed ? "已点赞" : "点赞" }}
  </XhToggle>
</template>
