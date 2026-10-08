var e=`// 插入与任意换位 | insert(index) 在指定位置插入一行，后面的行往后挪；move(from, to) 一步挪到任意位置，不必逐格上移
import type { ReactNode } from "react";
import {
  XhButton,
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [steps, setSteps] = useState<string[]>(["拉取代码", "跑构建", "发布"]);

  function setAt(index: number, next: string): void {
    setSteps(steps.map((item, i) => (i === index ? next : item)));
  }

  return (
    <XhFieldArrayRoot
      value={steps}
      onValueChange={details => setSteps(details.value as string[])}
      movable
      createItem={() => ""}
      style={{ maxInlineSize: "480px" }}
    >
      {({ items, insert, move }) => (
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
                <XhButton size="sm" variant="ghost" onClick={() => insert(row.index + 1)}>下方插入</XhButton>
                <XhButton size="sm" variant="ghost" disabled={row.index === 0} onClick={() => move(row.index, 0)}>置顶</XhButton>
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