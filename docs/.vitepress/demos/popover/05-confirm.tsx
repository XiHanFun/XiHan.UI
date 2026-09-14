// 确认气泡 | 标题、说明与两颗按钮拼成一次就地确认；两颗按钮按下后都只是把浮层收起
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
  const [removed, setRemoved] = useState(false);

  function confirm(setOpen: (next: boolean) => void): void {
    setRemoved(true);
    setOpen(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhPopoverRoot placement="top" size="sm">
        {({ setOpen }) => (
          <>
            <XhPopoverTrigger>删除这条记录</XhPopoverTrigger>
            <XhPopoverPositioner>
              <XhPopoverContent>
                <XhPopoverTitle>删除后不可恢复</XhPopoverTitle>
                <XhPopoverDescription>这条记录连同它的附件一起清掉。</XhPopoverDescription>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <XhButton size="sm" variant="ghost" onClick={() => setOpen(false)}>
                    取消
                  </XhButton>
                  <XhButton size="sm" variant="solid" tone="danger" onClick={() => confirm(setOpen)}>
                    删除
                  </XhButton>
                </div>
                <XhPopoverArrow />
              </XhPopoverContent>
            </XhPopoverPositioner>
          </>
        )}
      </XhPopoverRoot>
      <span>{removed ? "记录已删除" : "记录还在"}</span>
    </div>
  );
}
