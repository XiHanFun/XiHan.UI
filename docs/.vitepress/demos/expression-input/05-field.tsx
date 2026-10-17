// 放进表单字段 | 字段的标题与说明接到输入框上；组件自己的问题列表排在字段说明之后进描述链
import type { ExpressionCompletion } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";
import { XhExpressionInputRoot, XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/react";
import { useState } from "react";

const fields: ExpressionCompletion[] = [
  { label: "amount", kind: "variable", detail: "数字", description: "报销金额" },
  { label: "days", kind: "variable", detail: "数字", description: "出差天数" },
];

const check = createExpressionCheck(createExpressionEngine(), {
  identifiers: fields.map(field => field.label),
});

export default function Demo(): ReactNode {
  const [formula, setFormula] = useState("amount > 5000 || dyas > 7");

  return (
    <XhFieldRoot required>
      <XhFieldLabel>需要复核的条件</XhFieldLabel>
      <XhFieldControl>
        <XhExpressionInputRoot
          value={formula}
          onValueChange={details => setFormula(details.value)}
          completions={fields}
          check={check}
        />
      </XhFieldControl>
      <XhFieldDescription>条件成立时，报销单转给财务复核</XhFieldDescription>
    </XhFieldRoot>
  );
}
