// 禁用 | disabled 把触发器整个关停，点击与键盘都不再改开合，已展开的内容维持原样
import type { ReactNode } from "react";
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px", display: "grid", gap: "12px" }}>
      <XhCollapsibleRoot disabled>
        <XhCollapsibleTrigger>收起且禁用</XhCollapsibleTrigger>
        <XhCollapsibleContent>点不开。</XhCollapsibleContent>
      </XhCollapsibleRoot>

      <XhCollapsibleRoot defaultOpen disabled>
        <XhCollapsibleTrigger>展开且禁用</XhCollapsibleTrigger>
        <XhCollapsibleContent>内容停在展开态，收不上。</XhCollapsibleContent>
      </XhCollapsibleRoot>
    </div>
  );
}
