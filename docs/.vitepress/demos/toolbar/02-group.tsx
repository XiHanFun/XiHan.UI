// 分组 | 将相关操作收在一起
import type { ReactNode } from "react";
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToolbarRoot aria-label="编辑操作">
      <XhToolbarGroup>
        <XhToolbarItem value="copy" type="button">复制</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="cut" type="button">剪切</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="paste" type="button">粘贴</XhToolbarItem>
      </XhToolbarGroup>
      <XhToolbarGroup>
        <XhToolbarItem value="undo" type="button">撤销</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="redo" type="button">重做</XhToolbarItem>
      </XhToolbarGroup>
    </XhToolbarRoot>
  );
}
