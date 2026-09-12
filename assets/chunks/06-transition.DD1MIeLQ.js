const n=`// 展开动画 | 收起时节点不卸载，作者接管内容区的 display，用一条行高过渡就能平滑展开
import type { ReactNode } from "react";
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: "420px", display: "grid", gap: "12px" }}>
      <XhCollapsibleRoot open={open} onOpenChange={details => setOpen(details.open)}>
        <XhCollapsibleTrigger>{open ? "收起详情" : "展开详情"}</XhCollapsibleTrigger>
        {/* 行高在 0fr 与 1fr 之间过渡，不必测量内容高度；
            内边距挪到内层，收起时外层才不留白；display 被接管后，收起态改用 inert 隔离 */}
        <XhCollapsibleContent
          inert={!open || undefined}
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            paddingBlock: "0",
            transition:
              "grid-template-rows var(--xh-motion-duration-enter) var(--xh-motion-ease-enter)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <p style={{ margin: 0, paddingBlock: "12px" }}>
              展开与收起都走同一条过渡，中途再点一次会从当前高度掉头。
            </p>
          </div>
        </XhCollapsibleContent>
      </XhCollapsibleRoot>
    </div>
  );
}
`;export{n as default};
