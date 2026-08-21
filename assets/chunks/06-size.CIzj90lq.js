const n=`<!-- 尺寸 | size 改条目间距与字号，不写即缺省中档 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
];
<\/script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
    <XhRadioGroupRoot
      :collection="plans"
      default-value="standard"
      label="sm"
      size="sm"
    />

    <XhRadioGroupRoot :collection="plans" default-value="standard" label="缺省" />

    <XhRadioGroupRoot
      :collection="plans"
      default-value="standard"
      label="lg"
      size="lg"
    />
  </div>
</template>
`;export{n as default};
