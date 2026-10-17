// 引用参数 | 给了 parameters 时每个条件可以在「值 / 参数」之间切换，只列类型相容的参数；值写成 { parameter: 名字 }
import type { FilterField, FilterGroup, FilterParameter } from "@xihan-ui/viz";
import type { ReactNode } from "react";
import { XhFilterBuilderRoot } from "@xihan-ui/react";
import { useState } from "react";

const fields: FilterField[] = [
  { name: "region", type: "string", label: "区域", options: [{ value: "east", label: "华东" }, { value: "south", label: "华南" }, { value: "north", label: "华北" }] },
  { name: "customer", type: "string", label: "客户" },
  { name: "amount", type: "number", label: "金额" },
  { name: "orderedAt", type: "date", label: "下单日期" },
  { name: "paid", type: "boolean", label: "已付款" },
];
const parameters: FilterParameter[] = [
  { name: "minAmount", type: "number", label: "最低金额" },
  { name: "since", type: "date", label: "起始日期" },
  { name: "regions", type: "string", multiple: true, label: "区域列表" },
];

export default function Demo(): ReactNode {
  const [filter, setFilter] = useState<FilterGroup>({
    logic: "and",
    conditions: [
      { field: "amount", operator: "gte", value: { parameter: "minAmount" } },
      { field: "orderedAt", operator: "gte", value: "2026-01-01" },
    ],
  });

  return (
    <>
      <XhFilterBuilderRoot value={filter} onValueChange={details => setFilter(details.value)} fields={fields} parameters={parameters} aria-label="订单筛选" />
      <p data-demo-output>{`值：${JSON.stringify(filter)}`}</p>
    </>
  );
}
