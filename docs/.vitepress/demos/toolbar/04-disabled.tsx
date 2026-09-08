// 禁用 | 禁用走 aria-disabled 而非原生 disabled：禁用项仍聚焦得上、仍能当方向键的起点，只是方向键路过时跳过它
import type { CSSProperties, ReactNode } from "react";
import {
  XhSwitch,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";
import { useState } from "react";

const itemStyle: CSSProperties = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};

export default function Demo(): ReactNode {
  const [locked, setLocked] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhToolbarRoot disabled={locked}>
        <XhToolbarItem value="cut" style={itemStyle}>剪切</XhToolbarItem>
        {/* 单项禁用：整条没锁时，方向键也只跳过这一项 */}
        <XhToolbarItem value="paste" style={itemStyle} disabled>
          粘贴（禁用）
        </XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="delete" style={itemStyle}>删除</XhToolbarItem>
      </XhToolbarRoot>

      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhSwitch checked={locked} onCheckedChange={details => setLocked(details.checked)} />
        整条禁用（方向键当场不再接管，焦点进来就停在容器上）
      </label>
    </div>
  );
}
