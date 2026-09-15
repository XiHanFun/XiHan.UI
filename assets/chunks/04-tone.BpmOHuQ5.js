const n=`// 颜色 | 使用语义颜色
import type { ReactNode } from "react";
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from "@xihan-ui/react";

const tones = [
  { tone: "brand", label: "品牌" },
  { tone: "success", label: "成功" },
  { tone: "warning", label: "警告" },
  { tone: "danger", label: "危险" },
  { tone: "info", label: "信息" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      {tones.map(item => (
        <XhTypographyParagraph key={item.tone}>
          <XhTypographyText tone={item.tone}>{item.label}</XhTypographyText>
        </XhTypographyParagraph>
      ))}
    </XhTypographyRoot>
  );
}
`;export{n as default};
