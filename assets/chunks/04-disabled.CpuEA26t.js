const e=`<!-- 禁用 | 单项禁用后点不动，方向键也跳过它；整组禁用则每一项都跟着禁用 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版", disabled: true },
];
const openPlans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
];
<\/script>

<template>
  <XhRadioGroupRoot :collection="plans" default-value="free" label="单项禁用" />

  <XhRadioGroupRoot
    :collection="openPlans"
    default-value="free"
    disabled
    label="整组禁用"
  />
</template>
`;export{e as default};
