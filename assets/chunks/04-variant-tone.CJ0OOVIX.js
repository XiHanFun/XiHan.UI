const e=`<!-- 变体 | 设置编辑框外观 -->
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
<\/script>

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
        <XhEditableEditTrigger aria-label="编辑" />
        <XhEditableSubmitTrigger aria-label="确认" />
        <XhEditableCancelTrigger aria-label="取消" />
      </XhEditableControl>
    </XhEditableRoot>
  </div>
</template>
`;export{e as default};
