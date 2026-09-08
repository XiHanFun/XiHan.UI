// 语气 | tone 落在触发按钮的展开态上，六种语气各展开一份做对照
import type { ReactNode } from "react";
import { XhCollapsibleContent, XhCollapsibleRoot, XhCollapsibleTrigger } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        alignItems: "start",
      }}
    >
      {tones.map(tone => (
        <XhCollapsibleRoot key={tone} tone={tone} defaultOpen>
          <XhCollapsibleTrigger>{tone}</XhCollapsibleTrigger>
          <XhCollapsibleContent>收起后触发按钮不吃语气色。</XhCollapsibleContent>
        </XhCollapsibleRoot>
      ))}
    </div>
  );
}
