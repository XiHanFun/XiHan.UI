// 只读与禁用 | 只读时里面的控件可聚焦、不可修改，加删钮不可用；禁用时整棵树不可操作
import type { FilterField } from "@xihan-ui/viz";
import type { ReactNode } from "react";
import { XhFilterBuilderRoot } from "@xihan-ui/react";

const fields: FilterField[] = [
  { name: "region", type: "string", label: "区域", options: [{ value: "east", label: "华东" }, { value: "south", label: "华南" }, { value: "north", label: "华北" }] },
  { name: "customer", type: "string", label: "客户" },
  { name: "amount", type: "number", label: "金额" },
  { name: "orderedAt", type: "date", label: "下单日期" },
  { name: "paid", type: "boolean", label: "已付款" },
];

export default function Demo(): ReactNode {
  return (
    <>
      <XhFilterBuilderRoot readOnly fields={fields} defaultValue={{ logic: "and", conditions: [{ field: "region", operator: "eq", value: "east" }] }} aria-label="只读的订单筛选" />
      <XhFilterBuilderRoot disabled fields={fields} defaultValue={{ logic: "and", conditions: [{ field: "region", operator: "eq", value: "east" }] }} aria-label="禁用的订单筛选" />
    </>
  );
}
