// 基础用法 | 创建等宽列
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const tones = ["brand", "info", "success"] as const;
const blockStyle = { "--xh-demo-block-block-size": "96px" } as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={3} gap="md" aria-label="三列等宽占位区块" style={{ inlineSize: "min(600px, 100%)" }}>
      {tones.map(tone => (
        <XhGridItem key={tone}>
          <span data-demo-block data-tone={tone} style={blockStyle} />
        </XhGridItem>
      ))}
    </XhGridRoot>
  );
}
