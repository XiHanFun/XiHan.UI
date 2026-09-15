const a=`// 层级 | default、secondary、tertiary 逐级增强表面，transparent 用于嵌套内容
import type { ReactNode } from "react";
import { XhCardContent, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

const variants = ["default", "secondary", "tertiary", "transparent"] as const;

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
`;export{a as default};
