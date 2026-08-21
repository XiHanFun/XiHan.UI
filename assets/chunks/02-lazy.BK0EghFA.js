const n=`<!-- 按需取数 | data 给函数就是点了才算：它可以返回 Promise，这段时间状态是 preparing，再点也不会重复取一遍 -->
<script setup lang="ts">
import { XhDownloadTrigger } from "@xihan-ui/vue";

// 点下去才拼这份 CSV，页面加载时不把整份内容备在内存里
async function makeCsv() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const rows = [
    ["日期", "订单号", "金额"],
    ["2026-08-01", "A-1001", "128.00"],
    ["2026-08-02", "A-1002", "96.50"],
  ];
  return rows.map((row) => row.join(",")).join("\\n");
}
<\/script>

<template>
  <XhDownloadTrigger
    :data="makeCsv"
    file-name="orders.csv"
    mime-type="text/csv"
  >
    导出订单（取数 600 毫秒）
  </XhDownloadTrigger>
</template>
`;export{n as default};
