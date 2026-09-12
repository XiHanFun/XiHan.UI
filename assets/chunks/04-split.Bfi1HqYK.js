const r=`// 分段与悬停 | split 在段与段之间画一条分隔线；hoverable 只在能用指针的设备上抬起
import type { ReactNode } from "react";
import { XhCardBody, XhCardFooter, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      <XhCardRoot variant="outline" split style={{ inlineSize: "220px" }}>
        <XhCardHeader>
          <XhCardTitle>分段</XhCardTitle>
        </XhCardHeader>
        <XhCardBody>头、身、脚之间各有一条线。</XhCardBody>
        <XhCardFooter>底部操作位</XhCardFooter>
      </XhCardRoot>

      <XhCardRoot variant="outline" hoverable style={{ inlineSize: "220px" }}>
        <XhCardHeader>
          <XhCardTitle>可悬停</XhCardTitle>
        </XhCardHeader>
        <XhCardBody>把指针移上来看抬起效果。</XhCardBody>
      </XhCardRoot>
    </div>
  );
}
`;export{r as default};
