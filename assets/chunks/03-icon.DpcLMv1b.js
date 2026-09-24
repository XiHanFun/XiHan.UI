const n=`// 图标与快捷键 | 补充常用命令的识别信息
import type { ReactNode } from "react";
import { FileIcon, FolderIcon, PencilIcon, PlusIcon, SaveIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemIndicator,
  XhMenubarItemShortcut,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhMenubarRoot style={{ background: "var(--xh-bg-subtle)" }}>
      <XhMenubarTrigger value="file">
        <XhIcon icon={FileIcon} size="sm" />
        文件
      </XhMenubarTrigger>
      <XhMenubarTrigger value="edit">
        <XhIcon icon={PencilIcon} size="sm" />
        编辑
      </XhMenubarTrigger>
      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="new">
            <XhMenubarItemIndicator><XhIcon icon={PlusIcon} size="sm" /></XhMenubarItemIndicator>
            <XhMenubarItemText>新建</XhMenubarItemText>
            <XhMenubarItemShortcut>⌘ N</XhMenubarItemShortcut>
          </XhMenubarItem>
          <XhMenubarItem value="open">
            <XhMenubarItemIndicator><XhIcon icon={FolderIcon} size="sm" /></XhMenubarItemIndicator>
            <XhMenubarItemText>打开</XhMenubarItemText>
            <XhMenubarItemShortcut>⌘ O</XhMenubarItemShortcut>
          </XhMenubarItem>
          <XhMenubarSeparator />
          <XhMenubarItem value="save">
            <XhMenubarItemIndicator><XhIcon icon={SaveIcon} size="sm" /></XhMenubarItemIndicator>
            <XhMenubarItemText>保存</XhMenubarItemText>
            <XhMenubarItemShortcut>⌘ S</XhMenubarItemShortcut>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
      <XhMenubarPositioner value="edit">
        <XhMenubarContent>
          <XhMenubarItem value="undo">撤销</XhMenubarItem>
          <XhMenubarItem value="redo">重做</XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>
  );
}
`;export{n as default};
