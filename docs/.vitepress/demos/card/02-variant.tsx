// 形态 | outline 为默认卡面，subtle 淡底嵌入，ghost 用于嵌套
import type { ReactNode } from "react";
import { XhCardContent, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {variants.map(v => (
        <XhCardRoot key={v} variant={v} style={{ inlineSize: "200px" }}>
          <XhCardHeader>
            <XhCardTitle>{v}</XhCardTitle>
          </XhCardHeader>
          <XhCardContent>一段用来看表面层级的正文。</XhCardContent>
        </XhCardRoot>
      ))}
    </div>
  );
}
