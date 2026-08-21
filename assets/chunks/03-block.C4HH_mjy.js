const e=`<!-- 撑满行宽 | block 让整组占满一行，各段等分剩余空间，长短不一的文字也排得齐 -->
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const modes = [
  { value: "auto", label: "自动" },
  { value: "manual", label: "手动" },
  { value: "scheduled", label: "按计划执行" },
];
<\/script>

<template>
  <div style="inline-size: 420px">
    <XhSegmentedRoot
      :collection="modes"
      block
      default-value="auto"
      aria-label="执行方式"
    />
  </div>
</template>
`;export{e as default};
