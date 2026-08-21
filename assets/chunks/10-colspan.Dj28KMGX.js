const l=`<!-- 跨列单元格 | colspan 从它自己那一列往后算，报成 aria-colspan；1 与省略同义，所以只在真跨了列时写 -->
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "team", label: "小组", width: "8rem" },
  { id: "h1", label: "上半年" },
  { id: "h2", label: "下半年" },
];

const teams = [
  { id: "t1", team: "平台研发", h1: "42", h2: "51" },
  { id: "t2", team: "前端体验", h1: "36", h2: "39" },
];

// 汇总行也占一个行号，只是它那格横跨了两列
const rows = [...teams.map((t) => ({ id: t.id })), { id: "sum" }];
<\/script>

<template>
  <div style="width: 100%; max-width: 520px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableCaption>交付单量</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="t in teams" :key="t.id" :value="t.id">
          <XhTableCell value="team">{{ t.team }}</XhTableCell>
          <XhTableCell value="h1">{{ t.h1 }}</XhTableCell>
          <XhTableCell value="h2">{{ t.h2 }}</XhTableCell>
        </XhTableRow>
        <XhTableRow value="sum">
          <XhTableCell value="team">全年</XhTableCell>
          <!-- 从 h1 起跨两列，这一行因此只写两个格子 -->
          <XhTableCell value="h1" :colspan="2">168</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
`;export{l as default};
