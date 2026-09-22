// 图标与快捷键 | 在命令两侧补充识别信息
import type { ReactNode } from "react";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemShortcut,
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
            <XhContextMenuItemIndicator><XhIcon icon={CopyIcon} size="sm" /></XhContextMenuItemIndicator>
            <XhContextMenuItemText>复制</XhContextMenuItemText>
            <XhContextMenuItemShortcut>⌘ C</XhContextMenuItemShortcut>
          </XhContextMenuItem>
          <XhContextMenuItem value="rename">
            <XhContextMenuItemIndicator><XhIcon icon={PencilIcon} size="sm" /></XhContextMenuItemIndicator>
            <XhContextMenuItemText>重命名</XhContextMenuItemText>
            <XhContextMenuItemShortcut>F2</XhContextMenuItemShortcut>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhContextMenuItemIndicator><XhIcon icon={TrashIcon} size="sm" /></XhContextMenuItemIndicator>
            <XhContextMenuItemText>移到回收站</XhContextMenuItemText>
            <XhContextMenuItemShortcut>⌫</XhContextMenuItemShortcut>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  );
}
