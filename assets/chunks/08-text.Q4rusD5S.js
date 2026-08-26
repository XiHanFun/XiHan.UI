const e=`<!-- 原文视图 | view="text" 直接出缩进过的 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const payload = {
  orderNo: "SO-2026-0825-0417",
  amount: 12.5,
  items: [
    { sku: "A-1001", qty: 2 },
    { sku: "B-2003", qty: 1 },
  ],
  remark: "跨境订单，需人工复核收件地址与税号",
};

const view = ref<"tree" | "text">("text");
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px; inline-size: 100%; max-inline-size: 420px">
    <label style="display: flex; align-items: center; gap: 6px">
      <input v-model="view" type="checkbox" true-value="text" false-value="tree" />
      原文视图
    </label>
    <XhJsonViewerRoot :value="payload" :view="view" :default-expanded-depth="2" />
  </div>
</template>
`;export{e as default};
