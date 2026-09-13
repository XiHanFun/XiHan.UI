const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 分组 | 使用标题与分隔线组织命令 -->
<script setup lang="ts">
import { XhButton, XhMenuRoot } from "@xihan-ui/vue";

const actions = [
  { value: "compact", label: "紧凑", group: "density", groupLabel: "行高" },
  { value: "comfortable", label: "宽松", group: "density" },
  { value: "sidebar", label: "侧栏", group: "panels", groupLabel: "面板", separatorBefore: true },
  { value: "inspector", label: "属性面板", group: "panels" },
];
<\/script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger><XhButton variant="subtle">视图</XhButton></template>
  </XhMenuRoot>
</template>
`;export{e as default};
