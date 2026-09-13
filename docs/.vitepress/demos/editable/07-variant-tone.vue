<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | 设置编辑框外观 -->
<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhEditableRoot
      v-for="row in [
        { variant: 'outline', label: '描边' },
        { variant: 'subtle', label: '浅色' },
        { variant: 'ghost', label: '幽灵' },
      ]"
      :key="row.label"
      :variant="row.variant"
      default-value="曦寒"
      placeholder="未填写"
    >
      <XhEditableLabel>{{ row.label }}</XhEditableLabel>
      <XhEditableControl>
        <XhEditablePreview />
        <XhEditableInput />
        <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
        <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
      </XhEditableControl>
    </XhEditableRoot>
  </div>
</template>
