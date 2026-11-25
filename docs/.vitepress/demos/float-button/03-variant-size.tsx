// 形态与尺寸 | variant 设置浮动按钮的表面，size 取小、中、大三档
import type { ActionVariant, Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

const variants: ActionVariant[] = ["outline", "solid", "subtle", "ghost"];
const sizes: Size[] = ["sm", "md", "lg"];

const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-4)" } as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-4)" }}>
      <div style={row}>
        {variants.map(variant => (
          <XhFloatButtonRoot key={variant} style={{ position: "static" }} variant={variant}>
            <XhFloatButtonTrigger />
            <XhFloatButtonList />
          </XhFloatButtonRoot>
        ))}
      </div>
      <div style={row}>
        {sizes.map(size => (
          <XhFloatButtonRoot key={size} style={{ position: "static" }} size={size}>
            <XhFloatButtonTrigger />
            <XhFloatButtonList />
          </XhFloatButtonRoot>
        ))}
      </div>
    </div>
  );
}
