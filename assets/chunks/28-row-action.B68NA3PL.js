var e=`<!-- 行主操作 | 点一行报告行与点中的那一列，焦点停在行上按 Enter 报告行：据此下钻或联动 -->
<script setup lang="ts">
import type { TableActionDetails } from "@xihan-ui/headless";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const columns = [
  { id: "region", label: "大区", width: "8rem" },
  { id: "orders", label: "订单", align: "end" as const },
  { id: "amount", label: "金额", align: "end" as const },
];

const sales = [
  { id: "north", region: "华北", orders: "1,204", amount: "¥ 386,200" },
  { id: "east", region: "华东", orders: "2,318", amount: "¥ 742,900" },
  { id: "south", region: "华南", orders: "1,876", amount: "¥ 590,400" },
];

const rows = sales.map(s => ({ id: s.id }));
const picked = ref<TableActionDetails | null>(null);
<\/script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 8px">
    <XhTableRoot :columns="columns" :rows="rows" @action="picked = $event">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="s in sales" :key="s.id" :value="s.id">
          <XhTableCell value="region">{{ s.region }}</XhTableCell>
          <XhTableCell value="orders">{{ s.orders }}</XhTableCell>
          <XhTableCell value="amount">{{ s.amount }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span data-demo-output>
      {{ picked ? \`行 \${picked.value}，列 \${picked.column ?? "（键盘）"}\` : "点一行，或焦点停在行上按 Enter" }}
    </span>
  </div>
</template>
`;export{e as default};