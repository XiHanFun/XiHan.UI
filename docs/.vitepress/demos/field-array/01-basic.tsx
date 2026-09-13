/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 添加和删除重复字段
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
      {({ items }) => (
        <>
          {/* key 用 items 给的 row.key：它跟着这一行走，不是下标 */}
          {items.map(row => (
            <XhFieldArrayItem key={row.key} index={row.index}>
              <XhFieldArrayItemContent>
                <input
                  className="xh-demo-control"
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
        </>
      )}
    </XhFieldArrayRoot>
  );
}
