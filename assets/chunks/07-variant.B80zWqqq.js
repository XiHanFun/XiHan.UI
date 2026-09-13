const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 形态 | ring 整圈、arc 一段弧、dots 三点；缺省档 ring 不输出 data-variant -->
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";
<\/script>

<template>
  <XhSpinner label="加载中" />
  <XhSpinner variant="arc" label="加载中" />
  <XhSpinner variant="dots" label="加载中" />
</template>
`;export{n as default};
