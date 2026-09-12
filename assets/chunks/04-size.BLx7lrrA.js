const n=`// 尺寸 | 三档同时换底座直径与图元直径；改形状、改直径都留了槽位
import type { Size } from "@xihan-ui/core";
import type { CSSProperties, ReactNode } from "react";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

const sizes: Size[] = ["sm", "md", "lg"];

const FolderIcon = {
  name: "folder",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2.5h8.5A1.5 1.5 0 0 1 21 10v7.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" } },
  ],
} as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {sizes.map(s => (
        <XhIconWrapper key={s} size={s} variant="subtle" tone="brand">
          <XhIcon icon={FolderIcon} />
        </XhIconWrapper>
      ))}

      {/* 方底座：形状与直径各留了一个槽位，写在节点上就换掉 */}
      <XhIconWrapper
        variant="subtle"
        tone="brand"
        style={{
          "--xh-icon-wrapper-radius": "var(--xh-radius-lg)",
          "--xh-icon-wrapper-size": "48px",
          "--xh-icon-wrapper-glyph-size": "24px",
        } as CSSProperties}
      >
        <XhIcon icon={FolderIcon} />
      </XhIconWrapper>
    </div>
  );
}
`;export{n as default};
