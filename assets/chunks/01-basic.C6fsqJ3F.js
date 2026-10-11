var e=`// 基础用法 | 添加和删除重复字段
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
  const [links, setLinks] = useState<string[]>(["https://xihan.fun", ""]);

  // 行里的控件是作者自己的，值也由作者自己写回
  function setAt(index: number, next: string): void {
    setLinks(links.map((item, i) => (i === index ? next : item)));
  }

  return (
    <XhFieldArrayRoot
      value={links}
      onValueChange={details => setLinks(details.value as string[])}
      createItem={() => ""}
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
    >
      {({ items }) => (
        <>
          {/* key 用 items 给的 row.key：它跟着这一行走，不是下标 */}
          {items.map(row => (
            <XhFieldArrayItem key={row.key} index={row.index}>
              <XhFieldArrayItemContent>
                <XhTextFieldRoot
                  placeholder="填一个链接"
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
          <XhFieldArrayAddTrigger>+ 添加链接</XhFieldArrayAddTrigger>
        </>
      )}
    </XhFieldArrayRoot>
  );
}
`;export{e as default};