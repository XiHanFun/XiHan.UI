const e=`// 对齐与分布 | 对齐内容并分配剩余空间
import type { CSSProperties, ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFlex align="center" justify="between" aria-label="两端对齐占位区块" style={{ inlineSize: "min(360px, 100%)", padding: "16px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
      <XhFlex align="center" gap="sm">
        <span data-demo-block="square" data-tone="brand" />
        <XhFlex orientation="vertical" gap="xs">
          <span data-demo-block="line" data-tone="info" style={{ "--xh-demo-block-inline-size": "88px" } as CSSProperties} />
          <span data-demo-block="line" data-tone="neutral" style={{ "--xh-demo-block-inline-size": "48px" } as CSSProperties} />
        </XhFlex>
      </XhFlex>
      <span data-demo-block="line" data-tone="success" style={{ "--xh-demo-block-inline-size": "64px" } as CSSProperties} />
    </XhFlex>
  );
}
`;export{e as default};
