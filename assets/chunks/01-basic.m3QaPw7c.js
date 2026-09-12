const r=`// 基础用法 | 除了 root，封面、头、身、脚都可选；只写用得上的那几段
import type { ReactNode } from "react";
import { XhCardBody, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhCardRoot variant="outline" style={{ maxInlineSize: "360px" }}>
      <XhCardHeader>
        <XhCardTitle>本月账单</XhCardTitle>
        <XhCardDescription>账期 7 月 1 日至 7 月 31 日</XhCardDescription>
      </XhCardHeader>
      <XhCardBody>共 128 笔支出，合计 3,240.00 元。</XhCardBody>
    </XhCardRoot>
  );
}
`;export{r as default};
