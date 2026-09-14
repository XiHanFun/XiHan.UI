// 基础用法 | 一个标签就是 root 加一段 label 文字；不写 closable 就没有关闭钮
import type { ReactNode } from "react";
import { XhTagLabel, XhTagRoot } from "@xihan-ui/react";

const topics = ["前端", "无头内核", "可访问性"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      {topics.map(topic => (
        <XhTagRoot key={topic}>
          <XhTagLabel>{topic}</XhTagLabel>
        </XhTagRoot>
      ))}
    </div>
  );
}
