// 拖动标题栏挪窗口 | 指针按在标题上，顺着 DOM 找到 content 部件，把累计位移写进它的 translate；入场动画走的是 transform，两者互不覆盖
import type { PointerEvent, ReactNode } from "react";
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const panel = useRef<HTMLElement | null>(null);
  const start = useRef({ x: 0, y: 0 });

  function begin(event: PointerEvent<HTMLElement>): void {
    const handle = event.currentTarget;
    panel.current = handle.closest<HTMLElement>("[data-scope=\"dialog\"][data-part=\"content\"]");
    if (!panel.current) {
      return;
    }
    dragging.current = true;
    start.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
    handle.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLElement>): void {
    if (!dragging.current || !panel.current) {
      return;
    }
    const next = { x: event.clientX - start.current.x, y: event.clientY - start.current.y };
    setOffset(next);
    panel.current.style.translate = `${next.x}px ${next.y}px`;
  }

  function end(event: PointerEvent<HTMLElement>): void {
    if (!dragging.current) {
      return;
    }
    dragging.current = false;
    panel.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  // 每次重新展开都是一块新面板，位移从零算起
  function reset(details: { open: boolean }): void {
    if (details.open) {
      setOffset({ x: 0, y: 0 });
    }
  }

  return (
    <XhDialogRoot translations={{ close: "关闭" }} onOpenChange={reset}>
      {({ setOpen }) => (
        <>
          <XhDialogTrigger>打开可拖动的对话框</XhDialogTrigger>
          <XhDialogContent>
            <XhDialogTitle
              style={{ cursor: "move", touchAction: "none" }}
              onPointerDown={begin}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            >
              拖住这一行挪窗口
            </XhDialogTitle>
            <XhDialogDescription>
              位移是相对居中位置累计的，收起再打开会回到正中。
            </XhDialogDescription>
            <p style={{ margin: 0, color: "var(--xh-fg-muted)" }}>
              {`当前位移：${Math.round(offset.x)} / ${Math.round(offset.y)}`}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <XhButton variant="solid" onClick={() => setOpen(false)}>关闭</XhButton>
            </div>
            <XhDialogCloseTrigger />
          </XhDialogContent>
        </>
      )}
    </XhDialogRoot>
  );
}
