// 不写结构 | 只给每一行的内容：行号、删除与新增把手由组件铺，每行的内容按行交给组件
import type { ReactNode } from "react";
import { XhFieldArrayRoot, XhTextFieldRoot } from "@xihan-ui/react";
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
      renderItemContent={item => (
        <XhTextFieldRoot
          placeholder="填一个链接"
          value={item.value as string}
          onValueChange={details => setAt(item.index, details.value)}
        />
      )}
    />
  );
}
