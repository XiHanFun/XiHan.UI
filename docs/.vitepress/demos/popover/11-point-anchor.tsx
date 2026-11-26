// 落在指针位置 | anchor 交一个只给得出矩形的虚拟锚点，浮层就固定在刚点击的位置；再点一次更换落点，不用再摆一颗看不见的触发器
import type { MouseEvent, ReactNode } from "react";
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
} from "@xihan-ui/react";
import { useState } from "react";

interface PointAnchor {
  getBoundingClientRect: () => DOMRect;
}

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  // 虚拟锚点：每次定位现读矩形；换一个对象，浮层即按新落点重挂
  const [anchor, setAnchor] = useState<PointAnchor | null>(null);

  function pin(event: MouseEvent<HTMLDivElement>): void {
    const { clientX: x, clientY: y } = event;
    setPoint({ x, y });
    setAnchor({ getBoundingClientRect: () => new DOMRect(x, y, 0, 0) });
    setOpen(true);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          blockSize: "200px",
          border: "var(--xh-stroke-thin) dashed var(--xh-border-default)",
          borderRadius: "var(--xh-shape-surface)",
          color: "var(--xh-fg-muted)",
          cursor: "crosshair",
        }}
        onClick={pin}
      >
        在这块区域里点一下
      </div>

      <XhPopoverRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        anchor={anchor}
        placement="bottom-start"
        offset={8}
        closeOnInteractOutside={false}
        translations={{ close: "关闭" }}
      >
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>这一点</XhPopoverTitle>
            <XhPopoverDescription>
              {`落点 ${point.x} / ${point.y}，按 Escape 收起。`}
            </XhPopoverDescription>
            <XhPopoverCloseTrigger />
            <XhPopoverArrow />
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
    </div>
  );
}
