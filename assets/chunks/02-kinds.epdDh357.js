var e=`<!-- 限定种类 | kinds 只留数字与百分比；连同「不设格式」不超过三项时，种类改用分段切换 -->
<script setup lang="ts">
import { XhFormatInputRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhFormatInputRoot
    :kinds="['number', 'percent']"
    :default-value="{ kind: 'percent', decimals: 1 }"
    aria-label="占比格式"
  />
</template>
`;export{e as default};