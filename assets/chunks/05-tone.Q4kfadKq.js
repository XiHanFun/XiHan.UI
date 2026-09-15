const n=`// 语气 | tone 决定命中片段用哪族颜色，没命中的文本不受影响
import type { ReactNode } from "react";
import { XhHighlight } from "@xihan-ui/react";

const text = "曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。";
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {tones.map(tone => (
        <p key={tone} style={{ margin: "0 0 6px" }}>
          <XhHighlight text={text} keyword="组件" tone={tone} />
        </p>
      ))}
    </>
  );
}
`;export{n as default};
