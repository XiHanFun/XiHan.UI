const e=`<!-- 行展开 | 行上标了 expandable 才认展开把手与左右方向键；详情行占一个真实行号，收起只加 hidden 不卸载内部节点 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableExpandedRow,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "expand", width: "2.5rem" },
  { id: "order", label: "订单号", width: "9rem" },
  { id: "amount", label: "金额" },
];

const orders = [
  { id: "o1", no: "XH-2026-0001", amount: "¥ 1,280", detail: "键盘 ×1、鼠标 ×2" },
  { id: "o2", no: "XH-2026-0002", amount: "¥ 320", detail: "显示器支架 ×1" },
  { id: "o3", no: "XH-2026-0003", amount: "¥ 96", detail: "线材若干" },
];

const rows = orders.map((o) => ({ id: o.id, expandable: true }));

const expanded = ref<string[]>(["o1"]);
<\/script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot v-model:expanded="expanded" :columns="columns" :rows="rows">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="expand" />
          <XhTableColumnHeader value="order">订单号</XhTableColumnHeader>
          <XhTableColumnHeader value="amount">金额</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <template v-for="o in orders" :key="o.id">
          <XhTableRow :value="o.id">
            <XhTableCell value="expand">
              <XhTableExpandTrigger>▸</XhTableExpandTrigger>
            </XhTableCell>
            <XhTableCell value="order">{{ o.no }}</XhTableCell>
            <XhTableCell value="amount">{{ o.amount }}</XhTableCell>
          </XhTableRow>
          <!-- 详情行紧跟它所属的数据行，整行铺开靠 colspan -->
          <XhTableExpandedRow :value="o.id">
            <XhTableCell value="expand" :colspan="3">明细：{{ o.detail }}</XhTableCell>
          </XhTableExpandedRow>
        </template>
      </XhTableBody>
    </XhTableRoot>
    <span>展开：{{ expanded.length ? expanded.join("、") : "（无）" }}</span>
  </div>
</template>
`;export{e as default};
