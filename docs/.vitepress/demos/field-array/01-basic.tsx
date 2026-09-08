// 基础用法 | 加一行、删一行归组件管；行里放什么控件归作者，写在 item-content 里
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
      style={{ maxInlineSize: "420px" }}
    >
      {({ items, count }) => (
        <>
          {/* key 用 items 给的 row.key：它跟着这一行走，不是下标 */}
          {items.map(row => (
            <XhFieldArrayItem key={row.key} index={row.index}>
              <XhFieldArrayItemContent>
                <input
                  style={{ inlineSize: "100%" }}
                  placeholder="填一个链接"
                  value={row.value as string}
                  onChange={event => setAt(row.index, event.target.value)}
                />
              </XhFieldArrayItemContent>
              <XhFieldArrayItemAction>
                <XhFieldArrayItemDeleteTrigger />
              </XhFieldArrayItemAction>
            </XhFieldArrayItem>
          ))}
          <XhFieldArrayAddTrigger>+ 添加链接</XhFieldArrayAddTrigger>
          <p>{`共 ${count} 条`}</p>
        </>
      )}
    </XhFieldArrayRoot>
  );
}
