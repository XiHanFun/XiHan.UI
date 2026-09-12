const n=`// 拖边缘改厚度 | 面板里放一根把手，拖动时把新厚度写进 content 的 --xh-drawer-size；这个槽压过 size 三档，滑入滑出仍按面板自身宽度算
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

const MIN = 260;
const MAX = 560;

const handleStyle: CSSProperties = {
  position: "absolute",
  insetBlock: 0,
  insetInlineStart: 0,
  inlineSize: "8px",
  cursor: "ew-resize",
  touchAction: "none",
};

export default function Demo(): ReactNode {
  const [width, setWidth] = useState(0);
  const dragging = useRef(false);
  const panel = useRef<HTMLElement | null>(null);

  function begin(event: PointerEvent<HTMLDivElement>): void {
    const handle = event.currentTarget;
    panel.current = handle.closest<HTMLElement>("[data-scope=\\"drawer\\"][data-part=\\"content\\"]");
    if (!panel.current)
      return;
    dragging.current = true;
    // 起点取面板当前的实际厚度
    setWidth(Math.round(panel.current.getBoundingClientRect().width));
    handle.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLDivElement>): void {
    if (!dragging.current || !panel.current)
      return;
    // 面板贴右边，厚度就是视口右缘到指针的距离
    const next = Math.round(Math.min(MAX, Math.max(MIN, window.innerWidth - event.clientX)));
    setWidth(next);
    panel.current.style.setProperty("--xh-drawer-size", \`\${next}px\`);
  }

  function end(event: PointerEvent<HTMLDivElement>): void {
    if (!dragging.current)
      return;
    dragging.current = false;
    panel.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <XhDrawerRoot translations={{ close: "关闭" }}>
      {({ setOpen }) => (
        <>
          <XhDrawerTrigger>打开可调宽的抽屉</XhDrawerTrigger>
          <XhDrawerContent>
            <div
              style={handleStyle}
              onPointerDown={begin}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            />
            <XhDrawerTitle>字段设置</XhDrawerTitle>
            <XhDrawerDescription>
              {\`拖面板左边缘，厚度在 \${MIN} 到 \${MAX} 像素之间取值。\`}
            </XhDrawerDescription>
            <p style={{ margin: 0, color: "var(--xh-fg-muted)" }}>
              {\`当前厚度：\${width ? \`\${width} px\` : "默认"}\`}
            </p>
            <XhButton variant="solid" onClick={() => setOpen(false)}>关闭</XhButton>
            <XhDrawerCloseTrigger />
          </XhDrawerContent>
        </>
      )}
    </XhDrawerRoot>
  );
}
`;export{n as default};
