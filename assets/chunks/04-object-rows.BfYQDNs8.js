var e=`// 多字段行 | 每行包含多个输入框
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
      style={{ inlineSize: "100%", maxInlineSize: "480px" }}
    >
      {({ items }) => (
        <>
          {items.map((row) => {
            const header = row.value as Header;
            return (
              <XhFieldArrayItem key={row.key} index={row.index}>
                <XhFieldArrayItemContent>
                  <XhTextFieldRoot
                    placeholder="字段名"
                    value={header.name}
                    onValueChange={details => patch(row.index, "name", details.value)}
                  >
                    <XhTextFieldControl>
                      <XhTextFieldInput />
                    </XhTextFieldControl>
                  </XhTextFieldRoot>
                  <XhTextFieldRoot
                    placeholder="字段值"
                    value={header.value}
                    onValueChange={details => patch(row.index, "value", details.value)}
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
            );
          })}
          <XhFieldArrayAddTrigger>+ 添加请求头</XhFieldArrayAddTrigger>
        </>
      )}
    </XhFieldArrayRoot>
  );
}
`;export{e as default};