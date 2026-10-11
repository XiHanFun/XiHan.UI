var e=`// 排序 | 上移或下移字段
import type { ReactNode } from "react";
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayMoveDownTrigger,
  XhFieldArrayMoveUpTrigger,
  XhFieldArrayRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [steps, setSteps] = useState<string[]>(["拉取代码", "安装依赖", "跑构建", "发布"]);

  function setAt(index: number, next: string): void {
    setSteps(steps.map((item, i) => (i === index ? next : item)));
  }

  return (
    <XhFieldArrayRoot
      value={steps}
      onValueChange={details => setSteps(details.value as string[])}
      movable
      createItem={() => ""}
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
    >
      {({ items }) => (
        <>
          {items.map(row => (
            <XhFieldArrayItem key={row.key} index={row.index}>
              <XhFieldArrayItemContent>
                <span style={{ inlineSize: "1.5rem" }}>{\`\${row.index + 1}.\`}</span>
                <XhTextFieldRoot
                  placeholder="这一步做什么"
                  value={row.value as string}
                  onValueChange={details => setAt(row.index, details.value)}
                >
                  <XhTextFieldControl>
                    <XhTextFieldInput />
                  </XhTextFieldControl>
                </XhTextFieldRoot>
              </XhFieldArrayItemContent>
              <XhFieldArrayItemAction>
                <XhFieldArrayMoveUpTrigger />
                <XhFieldArrayMoveDownTrigger />
                <XhFieldArrayItemDeleteTrigger />
              </XhFieldArrayItemAction>
            </XhFieldArrayItem>
          ))}
          <XhFieldArrayAddTrigger>+ 添加一步</XhFieldArrayAddTrigger>
        </>
      )}
    </XhFieldArrayRoot>
  );
}
`;export{e as default};