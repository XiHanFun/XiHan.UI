var e=`// 基础用法 | 组里是条件，每个条件是字段、运算符与值；运算符按字段类型给出，值的控件随运算符换，增删改都派发一棵新树
import type { FilterField, FilterGroup } from "@xihan-ui/viz";
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

export default function Demo(): ReactNode {
  const [filter, setFilter] = useState<FilterGroup>({
    logic: "and",
    conditions: [
      { field: "region", operator: "eq", value: "east" },
      { field: "amount", operator: "between", value: [1000, 5000] },
    ],
  });

  return (
    <>
      <XhFilterBuilderRoot value={filter} onValueChange={details => setFilter(details.value)} fields={fields} aria-label="订单筛选" />
      <p data-demo-output>{\`值：\${JSON.stringify(filter)}\`}</p>
    </>
  );
}
`;export{e as default};