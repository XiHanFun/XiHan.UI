const n=`<!-- 自己排版每一段 | 默认插槽给出拆好的时、分、秒、毫秒，想把每段装进独立的格子就自己写 -->
<script setup lang="ts">
import { XhCountdown } from "@xihan-ui/vue";

const value = 3723 * 1000;
<\/script>

<template>
  <XhCountdown v-slot="{ hours, minutes, seconds }" :value="value">
    <b>{{ String(hours).padStart(2, "0") }}</b>
    <span>时</span>
    <b>{{ String(minutes).padStart(2, "0") }}</b>
    <span>分</span>
    <b>{{ String(seconds).padStart(2, "0") }}</b>
    <span>秒</span>
  </XhCountdown>
</template>
`;export{n as default};
