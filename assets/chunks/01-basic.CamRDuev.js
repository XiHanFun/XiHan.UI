const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 从按钮打开一组操作 -->
<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuRoot } from "@xihan-ui/vue";

const actions = [
  { value: "new", label: "新建文件" },
  { value: "open", label: "打开文件" },
  { value: "save", label: "保存" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];
<\/script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger>
      <XhButton variant="subtle">
        操作
        <XhIcon :icon="ChevronDownIcon" />
      </XhButton>
    </template>
  </XhMenuRoot>
</template>
`;export{n as default};
