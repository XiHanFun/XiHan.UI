// 不归还焦点 | restoreFocus 为 false 时停用后焦点留在原处，适合停用后紧接着要把焦点交给别处的场合
import type { ReactNode } from "react";
import { XhButton, XhFocusTrap } from "@xihan-ui/react";
import { useState } from "react";

const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-2)" } as const;

export default function Demo(): ReactNode {
  const [active, setActive] = useState(false);
  return (
    <>
      <div style={row}>
        <XhButton disabled={active} onClick={() => setActive(true)}>激活</XhButton>
        <XhFocusTrap active={active} restoreFocus={false} style={row}>
          <XhButton tone="neutral">第一项</XhButton>
          <XhButton tone="neutral" onClick={() => setActive(false)}>停用</XhButton>
        </XhFocusTrap>
      </div>
      <p data-demo-output>{active ? "焦点陷在右边两颗按钮里" : "未激活"}</p>
    </>
  );
}
