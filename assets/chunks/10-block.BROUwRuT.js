var e=`<!-- 撑满行宽 | segmented 形态加 block 使整组占满一行，各段等分剩余空间，长短不一的文字也能对齐 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const modes = [
  { value: "auto", label: "自动" },
  { value: "manual", label: "手动" },
  { value: "scheduled", label: "按计划执行" },
];
<\/script>

<template>
  <div style="inline-size: 420px">
    <XhRadioGroupRoot
      variant="segmented"
      block
      :collection="modes"
      default-value="auto"
      label="执行方式"
    />
  </div>
</template>
`;export{e as default};