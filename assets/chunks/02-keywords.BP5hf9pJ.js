const t=`// 一组关键词 | 传数组即可；同一处多个关键词都命中时取最长的那个，重叠只切出一段
import type { ReactNode } from "react";
import { XhHighlight } from "@xihan-ui/react";

const text = "曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。";
const keywords = ["曦寒", "设计系统", "行为"];

// 「设计」与「设计系统」在同一处起跳，切出来的是长的那个
const overlapping = ["设计", "设计系统"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <XhHighlight text={text} keyword={keywords} />
      <XhHighlight text={text} keyword={overlapping} />
    </div>
  );
}
`;export{t as default};
