// 换行与行内 | 换行排列或随文字排布
import type { CSSProperties, ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const tags = [
  { id: 1, tone: "brand", width: "56px" },
  { id: 2, tone: "info", width: "72px" },
  { id: 3, tone: "success", width: "64px" },
  { id: 4, tone: "warning", width: "80px" },
  { id: 5, tone: "danger", width: "68px" },
] as const;

function tagStyle(width: string): CSSProperties {
  return {
    "--xh-demo-block-inline-size": width,
    "--xh-demo-block-block-size": "24px",
    "--xh-demo-block-radius": "var(--xh-shape-pill)",
  } as CSSProperties;
}

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="lg">
      <XhFlex wrap gap="sm" style={{ maxInlineSize: "280px" }}>
        {tags.map(tag => <span key={tag.id} data-demo-block data-tone={tag.tone} style={tagStyle(tag.width)} />)}
      </XhFlex>
      <XhFlex inline gap="xs" aria-label="行内占位区块">
        <span data-demo-block data-tone="brand" style={tagStyle("68px")} />
        <span data-demo-block data-tone="success" style={tagStyle("60px")} />
      </XhFlex>
    </XhFlex>
  );
}
