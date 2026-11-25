<!-- 语气、尺寸与状态 | tone 决定选中圆点使用哪族颜色；size 改变条目间距与字号，不写即默认中档；单项禁用后不可点击、方向键也跳过它，整组禁用则每一项都随之禁用 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const answers = [
  { value: "yes", label: "选中" },
  { value: "no", label: "未选" },
];
const sizePlans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
];
const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版", disabled: true },
];
const openPlans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <div style="display: flex; gap: var(--xh-space-8); flex-wrap: wrap">
      <XhRadioGroupRoot
        v-for="t in tones"
        :key="t"
        :collection="answers"
        :label="t"
        :tone="t"
        default-value="yes"
      />
    </div>

    <div style="display: flex; gap: var(--xh-space-8); flex-wrap: wrap; align-items: flex-start">
      <XhRadioGroupRoot
        :collection="sizePlans"
        default-value="standard"
        label="sm"
        size="sm"
      />

      <XhRadioGroupRoot :collection="sizePlans" default-value="standard" label="缺省" />

      <XhRadioGroupRoot
        :collection="sizePlans"
        default-value="standard"
        label="lg"
        size="lg"
      />
    </div>

    <div style="display: flex; gap: var(--xh-space-8); flex-wrap: wrap; align-items: flex-start">
      <XhRadioGroupRoot :collection="plans" default-value="free" label="单项禁用" />

      <XhRadioGroupRoot
        :collection="openPlans"
        default-value="free"
        disabled
        label="整组禁用"
      />
    </div>
  </div>
</template>
