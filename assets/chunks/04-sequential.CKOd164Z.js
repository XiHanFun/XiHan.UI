const e=`// 顺序排列 | 按文档顺序逐列填充
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const steps = [
  { id: 1, tone: "brand", height: "56px" },
  { id: 2, tone: "info", height: "72px" },
  { id: 3, tone: "success", height: "88px" },
  { id: 4, tone: "warning", height: "56px" },
  { id: 5, tone: "danger", height: "72px" },
  { id: 6, tone: "neutral", height: "88px" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhMasonry columns={3} gap="sm" sequential style={{ inlineSize: "min(640px, 100%)" }}>
      {steps.map(step => (
        <div key={step.id} data-demo-block data-tone={step.tone} style={{ "--xh-demo-block-block-size": step.height } as CSSProperties} />
      ))}
    </XhMasonry>
  );
}
`;export{e as default};
