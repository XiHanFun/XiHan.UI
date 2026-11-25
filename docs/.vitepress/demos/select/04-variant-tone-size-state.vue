<!-- 形态、语气、尺寸与状态 | 形态有 outline、subtle 和 ghost；tone 六种语气；size 小、中、大三档；disabled 禁止展开和聚焦 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-4)">
      <XhSelectRoot
        v-for="v in variants"
        :key="v"
        :variant="v"
        :collection="fruits"
        :default-value="['apple']"
        :label="v"
        placeholder="请选择"
      />
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-4)">
      <XhSelectRoot
        v-for="t in tones"
        :key="t"
        variant="outline"
        :tone="t"
        :collection="fruits"
        :default-value="['apple']"
        :label="t"
        placeholder="请选择"
      />
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--xh-space-4)">
      <XhSelectRoot
        v-for="s in sizes"
        :key="s.label"
        :size="s.size"
        :collection="fruits"
        :default-value="['apple']"
        :label="s.label"
        placeholder="请选择"
      />
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-4)">
      <XhSelectRoot
        :collection="fruits"
        :default-value="['apple']"
        disabled
        label="禁用"
        placeholder="请选择"
      />
    </div>
  </div>
</template>
