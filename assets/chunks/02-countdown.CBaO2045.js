const t=`<!-- 倒计时 | countdown 使它从起始值递减，终点默认是 0；到达终点即停在该处不再递减 -->
<script setup lang="ts">
import { XhTimerRoot } from "@xihan-ui/vue";

const twoMinutes = 2 * 60 * 1000;
<\/script>

<template>
  <XhTimerRoot countdown :start-ms="twoMinutes" auto-start />
</template>
`;export{t as default};
