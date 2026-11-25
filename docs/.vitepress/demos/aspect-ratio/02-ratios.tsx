// 常用比例 | 同样的列宽下，1 : 1、4 : 3、16 : 9 各按自己的比例定高，并排时也不被拉成同一个高
import type { CSSProperties, ReactNode } from "react";
import { XhAspectRatio } from "@xihan-ui/react";

const ratios = [
  { value: 1, tone: "brand" },
  { value: 4 / 3, tone: "info" },
  { value: 16 / 9, tone: "success" },
] as const;

const columns: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(var(--xh-layout-col-min-xs), 1fr))",
  gap: "var(--xh-space-3)",
  inlineSize: "100%",
};

const fill = { "--xh-demo-block-block-size": "100%" } as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={columns}>
      {ratios.map(ratio => (
        <XhAspectRatio key={ratio.value} ratio={ratio.value}>
          <span data-demo-block data-tone={ratio.tone} style={fill} />
        </XhAspectRatio>
      ))}
    </div>
  );
}
