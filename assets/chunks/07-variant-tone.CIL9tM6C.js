const e=`<!-- 形态与语气 | variant 换编辑态输入框的底与描边，tone 换聚焦描边与提交钮的色族；预览态不吃这两轴 -->
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
        { variant: 'outline', tone: 'brand', label: '描边 · 品牌' },
        { variant: 'subtle', tone: 'brand', label: '弱底 · 品牌' },
        { variant: 'ghost', tone: 'brand', label: '无壳 · 品牌' },
        { variant: 'outline', tone: 'success', label: '描边 · 成功' },
        { variant: 'outline', tone: 'danger', label: '描边 · 危险' },
      ]"
      :key="row.label"
      :variant="row.variant"
      :tone="row.tone"
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
`;export{e as default};
