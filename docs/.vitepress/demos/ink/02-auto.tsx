// 按底色选墨 | data-xh-ink="auto" 由 --xh-ink-surface 算相对亮度，浅底取黑墨、深底取白墨
import type { CSSProperties, ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";

const surfaces = ["var(--xh-color-orange-500)", "var(--xh-color-teal-300)", "var(--xh-color-purple-700)"];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: 12 }}>
      {surfaces.map(surface => (
        <section
          key={surface}
          data-xh-ink="auto"
          style={{ "--xh-ink-surface": surface, "background": surface, "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": 12, "padding": 16, "borderRadius": "var(--xh-shape-surface)" } as CSSProperties}
        >
          <XhButton>发布</XhButton>
          <XhButton variant="outline">取消</XhButton>
          <XhButton variant="ghost">稍后</XhButton>
        </section>
      ))}
    </div>
  );
}
