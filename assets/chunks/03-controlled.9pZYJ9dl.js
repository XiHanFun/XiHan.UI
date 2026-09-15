const n=`// 受控 | 传了 open 就由宿主说了算；悬停与 Escape 都只发意图，最终写不写由外面这颗按钮同一份状态决定
import type { ReactNode } from "react";
import {
  XhButton,
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhHoverCardRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        placement="bottom-start"
      >
        <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
        <XhHoverCardPositioner>
          <XhHoverCardContent>
            <XhHoverCardArrow />
            <strong>XiHan.UI</strong>
            <span>卡片从不抢焦点，也不锁页面滚动。</span>
          </XhHoverCardContent>
        </XhHoverCardPositioner>
      </XhHoverCardRoot>

      <XhButton variant="outline" onClick={() => setOpen(!open)}>
        {open ? "收起" : "展开"}
      </XhButton>
      <span>{\`当前：\${open ? "展开" : "收起"}\`}</span>
    </div>
  );
}
`;export{n as default};
