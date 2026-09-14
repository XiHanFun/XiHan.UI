// 图标与快捷键 | 在命令两侧补充识别信息
import type { ReactNode } from "react";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
  XhIcon,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhContextMenuRoot>
      <XhContextMenuTrigger
        style={{ display: "grid", placeItems: "center", inlineSize: "min(480px, 100%)", minBlockSize: "144px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)", cursor: "context-menu" }}
      >
        右键编辑 notes.md
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="copy">
            <XhIcon icon={CopyIcon} size="sm" />
            <XhContextMenuItemText>复制</XhContextMenuItemText>
            <span aria-hidden="true">⌘ C</span>
          </XhContextMenuItem>
          <XhContextMenuItem value="rename">
            <XhIcon icon={PencilIcon} size="sm" />
            <XhContextMenuItemText>重命名</XhContextMenuItemText>
            <span aria-hidden="true">F2</span>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhIcon icon={TrashIcon} size="sm" />
            <XhContextMenuItemText>移到回收站</XhContextMenuItemText>
            <span aria-hidden="true">⌫</span>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  );
}
