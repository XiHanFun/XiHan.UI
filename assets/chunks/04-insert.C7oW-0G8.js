var e=`// 插入字段 | 宿主的按钮调用 insert：在选区处插入字段名，焦点回到输入框，光标落在插入内容之后
import type { ExpressionCompletion } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";
import {
  XhButton,
  XhExpressionInputContent,
  XhExpressionInputControl,
  XhExpressionInputEmpty,
  XhExpressionInputHighlight,
  XhExpressionInputHighlightSegment,
  XhExpressionInputInput,
  XhExpressionInputIssue,
  XhExpressionInputIssues,
  XhExpressionInputItem,
  XhExpressionInputItemDescription,
  XhExpressionInputItemPrefix,
  XhExpressionInputItemSuffix,
  XhExpressionInputItemText,
  XhExpressionInputLabel,
  XhExpressionInputPositioner,
  XhExpressionInputRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const fields: ExpressionCompletion[] = [
  { label: "amount", kind: "variable", detail: "数字", description: "报销金额" },
  { label: "quantity", kind: "variable", detail: "数字", description: "数量" },
];

const check = createExpressionCheck(createExpressionEngine(), {
  identifiers: fields.map(field => field.label),
});

export default function Demo(): ReactNode {
  const [formula, setFormula] = useState("");

  // insert 经函数式 children 交出；写了 children 就由作者摆出各部件，按钮放在标题与外框之间
  return (
    <XhExpressionInputRoot
      value={formula}
      onValueChange={details => setFormula(details.value)}
      completions={fields}
      check={check}
    >
      {({ items, issues, segments, emptyText, kindText, insert }) => (
        <>
          <XhExpressionInputLabel>合计公式</XhExpressionInputLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {fields.map(field => (
              <XhButton key={field.label} size="sm" variant="outline" onClick={() => insert(field.label)}>
                {\`插入\${field.description}\`}
              </XhButton>
            ))}
          </div>
          <XhExpressionInputControl>
            <XhExpressionInputInput />
            <XhExpressionInputHighlight>
              {segments.map((segment, index) => (
                <XhExpressionInputHighlightSegment key={index} index={String(index)}>{segment.text}</XhExpressionInputHighlightSegment>
              ))}
            </XhExpressionInputHighlight>
          </XhExpressionInputControl>
          <XhExpressionInputIssues>
            {issues.map((issue, index) => (
              <XhExpressionInputIssue key={index} index={String(index)}>{issue.text}</XhExpressionInputIssue>
            ))}
          </XhExpressionInputIssues>
          <XhExpressionInputPositioner>
            <XhExpressionInputContent>
              {items.map(item => (
                <XhExpressionInputItem key={item.key} value={item.key}>
                  <XhExpressionInputItemPrefix>{kindText(item.kind)}</XhExpressionInputItemPrefix>
                  <XhExpressionInputItemText>{item.label}</XhExpressionInputItemText>
                  {item.detail && <XhExpressionInputItemSuffix>{item.detail}</XhExpressionInputItemSuffix>}
                  {item.description && <XhExpressionInputItemDescription>{item.description}</XhExpressionInputItemDescription>}
                </XhExpressionInputItem>
              ))}
            </XhExpressionInputContent>
            <XhExpressionInputEmpty>{emptyText}</XhExpressionInputEmpty>
          </XhExpressionInputPositioner>
        </>
      )}
    </XhExpressionInputRoot>
  );
}
`;export{e as default};