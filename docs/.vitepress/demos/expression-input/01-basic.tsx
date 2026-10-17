// 基础用法 | 输入名字弹出可引用的字段与函数；检查报出的问题在框下逐条列出，问题区间画波浪线
import type { ExpressionCompletion } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";
import { XhExpressionInputRoot } from "@xihan-ui/react";
import { useState } from "react";

const fields: ExpressionCompletion[] = [
  { label: "amount", kind: "variable", detail: "数字", description: "报销金额" },
  { label: "quantity", kind: "variable", detail: "数字", description: "数量" },
  { label: "applicant", kind: "variable", detail: "文本", description: "申请人" },
];

// 检查与补全用同一份名字：补全给出的名字，检查时不会被判为未知
const check = createExpressionCheck(createExpressionEngine(), {
  identifiers: fields.map(field => field.label),
});

export default function Demo(): ReactNode {
  const [formula, setFormula] = useState("ROUND(amount * quantity, 2) + amont");

  return (
    <>
      <XhExpressionInputRoot
        value={formula}
        onValueChange={details => setFormula(details.value)}
        label="合计公式"
        completions={fields}
        check={check}
        placeholder="如 amount * quantity"
      />
      <p data-demo-output>{`值：${formula || "（空）"}`}</p>
    </>
  );
}
