<!-- 单元格省略 | 列上标 truncate：放不下的字收成一行省略号，指针停在被裁掉的格子上时原生提示给出全文；放得下的格子不出提示，读屏照旧念全文 -->
<script setup lang="ts">
import type { TableColumnDef } from "@xihan-ui/headless";
import { XhTableRoot } from "@xihan-ui/vue";

interface Asset {
  id: string;
  name: string;
  path: string;
  size: string;
}

const columns: TableColumnDef<Asset>[] = [
  { id: "name", label: "文件", width: "8rem" },
  { id: "path", label: "路径", truncate: true },
  { id: "size", label: "大小", width: "5rem", align: "end" },
];

const assets: Asset[] = [
  { id: "a1", name: "logo.svg", path: "/assets/brand/logo.svg", size: "4 KB" },
  { id: "a2", name: "cover.png", path: "/assets/marketing/campaigns/2026-spring/landing/hero/cover.png", size: "812 KB" },
  { id: "a3", name: "report.pdf", path: "/shared/finance/quarterly-reports/2026/q1/board-meeting/final/report.pdf", size: "2.3 MB" },
  { id: "a4", name: "notes.md", path: "/docs/notes.md", size: "6 KB" },
];
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhTableRoot :columns="columns" :data="assets" aria-label="文件" />
  </div>
</template>
