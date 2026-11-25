// 最大宽度 | sm / md / lg / xl 四档与同名断点同宽，full 不限宽；轨道比舞台宽，各档的起止边线错开成台阶，横向滚动看全
import type { CSSProperties, ReactNode } from "react";
import { XhContainer, XhFlex } from "@xihan-ui/react";

const tiers = [
  { maxWidth: "sm", tone: "brand" },
  { maxWidth: "md", tone: "info" },
  { maxWidth: "lg", tone: "success" },
  { maxWidth: "xl", tone: "warning" },
  { maxWidth: "full", tone: "neutral" },
] as const;

// 每一档一行：档名在前，淡色占位块铺满版心剩下的宽度
const row: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--xh-space-2)" };
const label: CSSProperties = { minInlineSize: "var(--xh-space-8)", color: "var(--xh-fg-muted)", fontSize: "var(--xh-text-caption-size)" };

export default function Demo(): ReactNode {
  return (
    // 轨道取 xl 断点的 1.25 倍：比最宽的断点档还宽，full 与 xl 才分得开
    <div data-xh-scroll="" role="region" tabIndex={0} aria-label="最大宽度各档对照" style={{ inlineSize: "100%", overflowX: "auto" }}>
      <XhFlex orientation="vertical" gap="sm" style={{ inlineSize: "calc(var(--xh-breakpoint-xl) * 1.25)" }}>
        {tiers.map(tier => (
          <XhContainer key={tier.maxWidth} maxWidth={tier.maxWidth}>
            <div style={row}>
              <span style={label}>{tier.maxWidth}</span>
              <div data-demo-block data-tone={tier.tone} style={{ flex: 1 }} />
            </div>
          </XhContainer>
        ))}
      </XhFlex>
    </div>
  );
}
