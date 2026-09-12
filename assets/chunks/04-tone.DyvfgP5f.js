const a=`// 语气 | tone 决定这一段行内文字用哪族颜色，与 variant 是两个轴，可以一起写
import type { ReactNode } from "react";
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      {tones.map(t => (
        <XhTypographyParagraph key={t}>
          <XhTypographyText tone={t}>{\`\${t} 语气的一段文字\`}</XhTypographyText>
        </XhTypographyParagraph>
      ))}
      <XhTypographyParagraph>
        <XhTypographyText tone="danger" variant="strong">此操作不可撤销</XhTypographyText>
      </XhTypographyParagraph>
    </XhTypographyRoot>
  );
}
`;export{a as default};
