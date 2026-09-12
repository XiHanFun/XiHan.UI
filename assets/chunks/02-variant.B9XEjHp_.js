const n=`// 形态 | 四种形态只决定底色、描边与前景怎么用，直径与形状一个字不动
import type { ActionVariant } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

const variants: ActionVariant[] = ["solid", "subtle", "outline", "ghost"];

const CheckIcon = {
  name: "check",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6.5" } }],
} as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {variants.map(v => (
        <XhIconWrapper key={v} variant={v}>
          <XhIcon icon={CheckIcon} />
        </XhIconWrapper>
      ))}
    </div>
  );
}
`;export{n as default};
