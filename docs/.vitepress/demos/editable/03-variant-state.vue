<!-- 形态与状态 | variant 设置编辑框外观；禁用、只读与空值占位各是一种状态 -->
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

const variants = [
  { variant: "outline", label: "描边" },
  { variant: "subtle", label: "浅色" },
  { variant: "ghost", label: "幽灵" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <div style="display: flex; flex-direction: column; gap: var(--xh-space-3)">
      <XhEditableRoot
        v-for="row in variants"
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

    <div style="display: flex; flex-direction: column; gap: var(--xh-space-3)">
      <XhEditableRoot default-value="改不动" placeholder="未填写" disabled>
        <XhEditableLabel>禁用</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger aria-label="编辑" />
          <XhEditableSubmitTrigger aria-label="确认" />
          <XhEditableCancelTrigger aria-label="取消" />
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot default-value="只能看" placeholder="未填写" read-only>
        <XhEditableLabel>只读</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger aria-label="编辑" />
          <XhEditableSubmitTrigger aria-label="确认" />
          <XhEditableCancelTrigger aria-label="取消" />
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot placeholder="未填写">
        <XhEditableLabel>空值占位</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger aria-label="编辑" />
          <XhEditableSubmitTrigger aria-label="确认" />
          <XhEditableCancelTrigger aria-label="取消" />
        </XhEditableControl>
      </XhEditableRoot>
    </div>
  </div>
</template>
