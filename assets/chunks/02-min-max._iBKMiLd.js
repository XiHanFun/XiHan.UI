const n=`// 行数上下限 | 到 min 删除把手按不动、到 max 新增把手按不动；两者都转 aria-disabled，焦点留得住
import type { ReactNode } from "react";
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [options, setOptions] = useState<string[]>(["红", "绿"]);

  function setAt(index: number, next: string): void {
    setOptions(options.map((item, i) => (i === index ? next : item)));
  }

  return (
    <XhFieldArrayRoot
      value={options}
      onValueChange={details => setOptions(details.value as string[])}
      min={2}
      max={4}
      createItem={() => ""}
      style={{ maxInlineSize: "420px" }}
    >
      {({ items, count, atMin, atMax }) => (
        <>
          {items.map(row => (
            <XhFieldArrayItem key={row.key} index={row.index}>
              <XhFieldArrayItemContent>
                <input
                  style={{ inlineSize: "100%" }}
                  placeholder="填一个选项"
                  value={row.value as string}
                  onChange={event => setAt(row.index, event.target.value)}
                />
              </XhFieldArrayItemContent>
              <XhFieldArrayItemAction>
                <XhFieldArrayItemDeleteTrigger />
              </XhFieldArrayItemAction>
            </XhFieldArrayItem>
          ))}
          <XhFieldArrayAddTrigger>+ 添加选项</XhFieldArrayAddTrigger>
          <p>
            {\`\${count} / 4\`}
            {atMin ? <span> · 至少留 2 个</span> : null}
            {atMax ? <span> · 已到上限</span> : null}
          </p>
        </>
      )}
    </XhFieldArrayRoot>
  );
}
`;export{n as default};
