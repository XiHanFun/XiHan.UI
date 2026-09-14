// 子菜单 | 将相关命令收进下一层
import type { ReactNode } from "react";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhContextMenuRoot>
      <XhContextMenuTrigger
        style={{ display: "grid", placeItems: "center", inlineSize: "min(480px, 100%)", minBlockSize: "144px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)", cursor: "context-menu" }}
      >
        右键管理项目
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="open">打开</XhContextMenuItem>
          <XhContextMenuItem value="rename">重命名</XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuSub value="share">
            <XhContextMenuSubTrigger>发送到</XhContextMenuSubTrigger>
            <XhMenuPositioner>
              <XhMenuContent>
                <XhMenuItem value="email">邮件</XhMenuItem>
                <XhMenuItem value="message">消息</XhMenuItem>
              </XhMenuContent>
            </XhMenuPositioner>
          </XhContextMenuSub>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">移到回收站</XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  );
}
