const e=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦就看得见 -->
<script setup lang="ts">
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <!-- 正文颜色不归语气管，语气只落在底色、悬停描边与聚焦环上 -->
  <XhTextFieldRoot
    v-for="t in tones"
    :key="t"
    variant="subtle"
    :tone="t"
    placeholder="点进来看聚焦环"
  >
    <XhTextFieldLabel>{{ t }}</XhTextFieldLabel>
    <XhTextFieldInput style="inline-size: 160px" />
  </XhTextFieldRoot>
</template>
`;export{e as default};
