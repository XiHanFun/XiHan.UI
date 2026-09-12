const a=`// 形态 | variant 只改描边、底色与投影怎么用，各段的排版三档一致
import type { ReactNode } from "react";
import { XhCardBody, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

const variants = ["outline", "subtle", "elevated", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {variants.map(v => (
        <XhCardRoot key={v} variant={v} style={{ inlineSize: "200px" }}>
          <XhCardHeader>
            <XhCardTitle>{v}</XhCardTitle>
          </XhCardHeader>
          <XhCardBody>一段用来看底色与描边的正文。</XhCardBody>
        </XhCardRoot>
      ))}
    </div>
  );
}
`;export{a as default};
