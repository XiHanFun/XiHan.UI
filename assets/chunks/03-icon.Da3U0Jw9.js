var e=`// 图标与快捷键 | 在命令两侧补充识别信息
import type { ReactNode } from "react";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemIcon,
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
            <XhContextMenuItemIcon><XhIcon icon={CopyIcon} size="sm" /></XhContextMenuItemIcon>
            <XhContextMenuItemText>复制</XhContextMenuItemText>
            <XhContextMenuItemShortcut>⌘ C</XhContextMenuItemShortcut>
          </XhContextMenuItem>
          <XhContextMenuItem value="rename">
            <XhContextMenuItemIcon><XhIcon icon={PencilIcon} size="sm" /></XhContextMenuItemIcon>
            <XhContextMenuItemText>重命名</XhContextMenuItemText>
            <XhContextMenuItemShortcut>F2</XhContextMenuItemShortcut>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhContextMenuItemIcon><XhIcon icon={TrashIcon} size="sm" /></XhContextMenuItemIcon>
            <XhContextMenuItemText>移到回收站</XhContextMenuItemText>
            <XhContextMenuItemShortcut>⌫</XhContextMenuItemShortcut>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  );
}
`;export{e as default};