const n=`// 落在指针位置 | 触发器缩为一个像素、按点击坐标固定放置，浮层就固定在刚点击的位置；再点一次更换落点
import type { MouseEvent, ReactNode } from "react";
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
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
  const [point, setPoint] = useState({ x: 0, y: 0 });

  // 指针坐标是物理坐标，锚点用 left / top 摆位；一像素而非零像素，位移探测才武装得起来
  const anchorStyle = {
    position: "fixed" as const,
    left: \`\${point.x}px\`,
    top: \`\${point.y}px\`,
    inlineSize: "1px",
    blockSize: "1px",
    padding: 0,
    border: 0,
    opacity: 0,
    pointerEvents: "none" as const,
  };

  function pin(event: MouseEvent<HTMLDivElement>): void {
    setPoint({ x: event.clientX, y: event.clientY });
    setOpen(true);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          blockSize: "200px",
          border: "1px dashed var(--xh-border-default)",
          borderRadius: "8px",
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
        placement="bottom-start"
        offset={8}
        closeOnInteractOutside={false}
        translations={{ close: "关闭" }}
      >
        <XhPopoverTrigger tabIndex={-1} style={anchorStyle} />
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>这一点</XhPopoverTitle>
            <XhPopoverDescription>
              {\`落点 \${point.x} / \${point.y}，按 Escape 收起。\`}
            </XhPopoverDescription>
            <XhPopoverCloseTrigger />
            <XhPopoverArrow />
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
    </div>
  );
}
`;export{n as default};
