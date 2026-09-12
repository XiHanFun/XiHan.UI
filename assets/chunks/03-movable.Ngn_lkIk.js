const e=`// 换序 | movable 开了才出上下把手；挪完焦点跟着这一行走，键盘可以连按一路挪到底
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
          <p>{\`顺序：\${steps.join(" → ")}\`}</p>
        </>
      )}
    </XhFieldArrayRoot>
  );
}
`;export{e as default};
