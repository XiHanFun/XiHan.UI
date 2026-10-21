var e=`// 图标与快捷键 | 为常用命令补充识别信息
import type { ReactNode } from "react";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemIcon,
  XhMenuItemShortcut,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot>
      <XhMenuTrigger asChild>
        <XhButton variant="subtle">编辑</XhButton>
      </XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="copy">
            <XhMenuItemIcon><XhIcon icon={CopyIcon} size="sm" /></XhMenuItemIcon>
            <XhMenuItemText>复制</XhMenuItemText>
            <XhMenuItemShortcut>⌘ C</XhMenuItemShortcut>
          </XhMenuItem>
          <XhMenuItem value="rename">
            <XhMenuItemIcon><XhIcon icon={PencilIcon} size="sm" /></XhMenuItemIcon>
            <XhMenuItemText>重命名</XhMenuItemText>
            <XhMenuItemShortcut>F2</XhMenuItemShortcut>
          </XhMenuItem>
          <XhMenuSeparator />
          <XhMenuItem value="delete">
            <XhMenuItemIcon><XhIcon icon={TrashIcon} size="sm" /></XhMenuItemIcon>
            <XhMenuItemText>移到回收站</XhMenuItemText>
            <XhMenuItemShortcut>⌫</XhMenuItemShortcut>
          </XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  );
}
`;export{e as default};