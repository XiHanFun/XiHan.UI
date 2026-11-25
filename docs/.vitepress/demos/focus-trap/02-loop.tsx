// 不回绕 | loop 为 false 时 Tab 停在最后一个、Shift+Tab 停在第一个，焦点仍出不去；autoFocus 为 false 时激活不挪焦点，等焦点进来再陷住
import type { ReactNode } from "react";
import { XhButton, XhFocusTrap } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFocusTrap loop={false} autoFocus={false} style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-2)" }}>
      <XhButton tone="neutral">上一步</XhButton>
      <XhButton tone="neutral">下一步</XhButton>
      <XhButton>提交</XhButton>
    </XhFocusTrap>
  );
}
