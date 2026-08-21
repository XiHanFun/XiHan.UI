const n=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 solid 形态并置于按下态，语气差别最明显 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <XhToggle v-for="t in tones" :key="t" variant="solid" :tone="t" default-pressed>{{ t }}</XhToggle>
</template>
`;export{n as default};
