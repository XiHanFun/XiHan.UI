const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | value 与 max 共同决定百分比 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhProgress :value="30" />
    <XhProgress :value="72" />
    <XhProgress :value="3" :max="4" />
  </div>
</template>
`;export{n as default};
