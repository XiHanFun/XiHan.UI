// 多字段行 | 每行包含多个输入框
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
                    className="xh-demo-control"
                    style={{ inlineSize: "40%" }}
                    placeholder="字段名"
                    value={header.name}
                    onChange={event => patch(row.index, "name", event.target.value)}
                  />
                  <input
                    className="xh-demo-control"
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
  );
}
