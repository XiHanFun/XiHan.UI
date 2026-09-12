const e=`// 尺寸 | size 换的是整块正文的字号与段间距，不传 size 即默认档
import type { ReactNode } from "react";
import { XhTypographyHeading, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm" as const, label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg" as const, label: "大" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {sizes.map(s => (
        <XhTypographyRoot key={s.label} size={s.size}>
          <XhTypographyHeading level={4}>{\`\${s.label}档\`}</XhTypographyHeading>
          <XhTypographyParagraph>正文字号与段间距跟着档位走，标题档位另由 level 决定。</XhTypographyParagraph>
        </XhTypographyRoot>
      ))}
    </div>
  );
}
`;export{e as default};
