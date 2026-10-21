var e=`<!-- 只读与禁用 | 只读时里面的控件可聚焦、可复制，不可修改；禁用时整组不可操作 -->
<script setup lang="ts">
import { XhFormatInputRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhFormatInputRoot read-only :default-value="{ kind: 'number', decimals: 2, grouping: true }" aria-label="只读的金额格式" />
  <XhFormatInputRoot disabled :default-value="{ kind: 'percent', decimals: 1 }" aria-label="禁用的占比格式" />
</template>
`;export{e as default};