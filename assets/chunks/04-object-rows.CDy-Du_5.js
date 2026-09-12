const e=`// 一行多个字段 | 行数据是对象，createItem 造一个空项；改字段时整份重建数组，行号不跟着变
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

interface Header {
  name: string;
  value: string;
}

export default function Demo(): ReactNode {
  const [headers, setHeaders] = useState<Header[]>([
    { name: "Accept", value: "application/json" },
    { name: "X-Trace", value: "" },
  ]);

  function patch(index: number, key: keyof Header, next: string): void {
    setHeaders(headers.map((row, i) => (i === index ? { ...row, [key]: next } : row)));
  }

  return (
    <>
      <XhFieldArrayRoot
        value={headers}
        onValueChange={details => setHeaders(details.value as Header[])}
        movable
        createItem={() => ({ name: "", value: "" })}
        style={{ maxInlineSize: "480px" }}
      >
        {({ items }) => (
          <>
            {items.map((row) => {
              const header = row.value as Header;
              return (
                <XhFieldArrayItem key={row.key} index={row.index}>
                  <XhFieldArrayItemContent>
                    <input
                      style={{ inlineSize: "40%" }}
                      placeholder="字段名"
                      value={header.name}
                      onChange={event => patch(row.index, "name", event.target.value)}
                    />
                    <input
                      style={{ inlineSize: "60%" }}
                      placeholder="字段值"
                      value={header.value}
                      onChange={event => patch(row.index, "value", event.target.value)}
                    />
                  </XhFieldArrayItemContent>
                  <XhFieldArrayItemAction>
                    <XhFieldArrayMoveUpTrigger />
                    <XhFieldArrayMoveDownTrigger />
                    <XhFieldArrayItemDeleteTrigger />
                  </XhFieldArrayItemAction>
                </XhFieldArrayItem>
              );
            })}
            <XhFieldArrayAddTrigger>+ 添加请求头</XhFieldArrayAddTrigger>
          </>
        )}
      </XhFieldArrayRoot>
      <pre>{JSON.stringify(headers, null, 2)}</pre>
    </>
  );
}
`;export{e as default};
