const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 自定义颜色 | 设置渐变两端颜色 -->
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const gradients = [
  { label: "日落橙", from: "#f97316", to: "#ec4899" },
  { label: "极光紫", from: "#8b5cf6", to: "#06b6d4" },
  { label: "海洋蓝", from: "#0ea5e9", to: "#2563eb" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; font-size: 28px; font-weight: 700">
    <XhGradientText v-for="gradient in gradients" :key="gradient.label" :from="gradient.from" :to="gradient.to">
      {{ gradient.label }}
    </XhGradientText>
  </div>
</template>
`;export{n as default};
