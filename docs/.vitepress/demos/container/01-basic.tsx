// 基础用法 | 内容收进居中的版心：铺满所在的行，宽到最大宽度档就停下，左右留出内衬
import type { CSSProperties, ReactNode } from "react";
import { XhContainer, XhFlex } from "@xihan-ui/react";

// 虚线只为看清版心的边界：outline 不占盒，量出来的宽度与内衬与不画时一致
const outline: CSSProperties = {
  outline: "var(--xh-stroke-thin) dashed var(--xh-border-default)",
  outlineOffset: "calc(var(--xh-stroke-thin) * -1)",
};

export default function Demo(): ReactNode {
  return (
    <XhContainer style={outline}>
      <XhFlex orientation="vertical" gap="sm">
        <span data-demo-block="line" data-tone="brand" style={{ "--xh-demo-block-inline-size": "40%" } as CSSProperties} />
        <span data-demo-block="line" data-tone="neutral" />
        <span data-demo-block="line" data-tone="neutral" style={{ "--xh-demo-block-inline-size": "72%" } as CSSProperties} />
      </XhFlex>
    </XhContainer>
  );
}
