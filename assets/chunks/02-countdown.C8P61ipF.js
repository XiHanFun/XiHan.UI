const t=`<!-- 倒着走 | countdown 让它从起始值往下走，终点缺省是 0；走到终点就停在那里不再往下 -->
<script setup lang="ts">
import { XhTimerRoot } from "@xihan-ui/vue";

const twoMinutes = 2 * 60 * 1000;
<\/script>

<template>
  <XhTimerRoot countdown :start-ms="twoMinutes" auto-start />
</template>
`;export{t as default};
