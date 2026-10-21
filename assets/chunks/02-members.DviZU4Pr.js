var e=`// 成员补全 | 补全写成函数，由宿主按光标处的查询给出：在 $row. 之后只列行内字段
import type { ExpressionCompletion, ExpressionCompletionSource } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";
import { XhExpressionInputRoot } from "@xihan-ui/react";
import { useState } from "react";

const roots: ExpressionCompletion[] = [
  { label: "$row", kind: "variable", detail: "对象", description: "当前行" },
  { label: "$total", kind: "variable", detail: "数字", description: "全表合计" },
];
const rowFields: ExpressionCompletion[] = [
  { label: "price", kind: "variable", detail: "数字", description: "单价" },
  { label: "quantity", kind: "variable", detail: "数字", description: "数量" },
];

// 函数形式由宿主自己过滤：member 是点之前那串名字，word 是光标前正在写的名字
const completions: ExpressionCompletionSource = ({ word, member }) => {
  const pool = member === null ? roots : member === "$row" ? rowFields : [];
  return pool.filter(item => item.label.startsWith(word));
};

const check = createExpressionCheck(createExpressionEngine(), {
  identifiers: roots.map(item => item.label),
});

export default function Demo(): ReactNode {
  const [formula, setFormula] = useState("$row.price * $row.quantity / $total");

  return (
    <XhExpressionInputRoot
      value={formula}
      onValueChange={details => setFormula(details.value)}
      label="行占比"
      completions={completions}
      check={check}
    />
  );
}
`;export{e as default};