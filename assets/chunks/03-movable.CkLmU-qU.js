const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 排序 | 上移或下移字段
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
      style={{ maxInlineSize: "420px" }}
    >
      {({ items }) => (
        <>
          {items.map(row => (
            <XhFieldArrayItem key={row.key} index={row.index}>
              <XhFieldArrayItemContent>
                <span style={{ inlineSize: "1.5rem" }}>{\`\${row.index + 1}.\`}</span>
                <input
                  className="xh-demo-control"
                  style={{ inlineSize: "100%" }}
                  placeholder="这一步做什么"
                  value={row.value as string}
                  onChange={event => setAt(row.index, event.target.value)}
                />
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
