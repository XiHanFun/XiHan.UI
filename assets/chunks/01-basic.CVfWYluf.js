const t=`// 基础用法 | 根与条目的标签由使用者决定，这里写为 ul 与 li；条目中只写用得到的位
import type { ReactNode } from "react";
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/react";

const people = [
  { name: "张三", desc: "技术部 · 前端" },
  { name: "李四", desc: "技术部 · 后端" },
  { name: "王五", desc: "设计部 · 交互" },
];

export default function Demo(): ReactNode {
  return (
    <XhListRoot style={{ maxInlineSize: "360px" }}>
      {people.map(p => (
        <XhListItem key={p.name}>
          <XhListItemContent>
            <XhListItemTitle>{p.name}</XhListItemTitle>
            <XhListItemDescription>{p.desc}</XhListItemDescription>
          </XhListItemContent>
        </XhListItem>
      ))}
    </XhListRoot>
  );
}
`;export{t as default};
