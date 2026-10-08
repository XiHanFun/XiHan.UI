var e=`// 渐变字 | 为标题里的关键词铺品牌渐变
import type { ReactNode } from "react";
import { XhTypographyHeading, XhTypographyRoot, XhTypographyText } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      <XhTypographyHeading as="h2" level={1}>
        快速、轻量的
        <XhTypographyText variant="gradient">Headless 组件库</XhTypographyText>
      </XhTypographyHeading>
    </XhTypographyRoot>
  );
}
`;export{e as default};