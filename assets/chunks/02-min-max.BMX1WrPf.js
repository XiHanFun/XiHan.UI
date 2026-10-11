var e=`// 数量限制 | 设置最少和最多行数
import type { ReactNode } from "react";
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
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
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
    >
      {({ items }) => (
        <>
          {items.map(row => (
            <XhFieldArrayItem key={row.key} index={row.index}>
              <XhFieldArrayItemContent>
                <XhTextFieldRoot
                  placeholder="填一个选项"
                  value={row.value as string}
                  onValueChange={details => setAt(row.index, details.value)}
                >
                  <XhTextFieldControl>
                    <XhTextFieldInput />
                  </XhTextFieldControl>
                </XhTextFieldRoot>
              </XhFieldArrayItemContent>
              <XhFieldArrayItemAction>
                <XhFieldArrayItemDeleteTrigger />
              </XhFieldArrayItemAction>
            </XhFieldArrayItem>
          ))}
          <XhFieldArrayAddTrigger>+ 添加选项</XhFieldArrayAddTrigger>
        </>
      )}
    </XhFieldArrayRoot>
  );
}
`;export{e as default};