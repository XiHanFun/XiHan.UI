const o=`// 受控 | 传了 open 就由宿主说了算；这里额外关掉点外部关闭，只有按钮与 Escape 能收起
import type { ReactNode } from "react";
import {
  XhButton,
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhPopoverRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        placement="bottom-start"
        closeOnInteractOutside={false}
      >
        <XhPopoverTrigger>浮层</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>受控浮层</XhPopoverTitle>
            <XhPopoverDescription>
              点页面别处不再关它，Escape 仍然有效。
            </XhPopoverDescription>
            <XhPopoverArrow />
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>

      <XhButton variant="outline" onClick={() => setOpen(!open)}>
        {open ? "收起" : "展开"}
      </XhButton>
      <span>{\`当前：\${open ? "展开" : "收起"}\`}</span>
    </div>
  );
}
`;export{o as default};
