// 附着工具面 | 为悬浮工具条提供完整表面
import type { ReactNode } from "react";
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToolbarRoot variant="surface" aria-label="快捷操作">
      <XhToolbarGroup>
        <XhToolbarItem value="copy" type="button">复制</XhToolbarItem>
        <XhToolbarItem value="cut" type="button">剪切</XhToolbarItem>
        <XhToolbarItem value="paste" type="button">粘贴</XhToolbarItem>
      </XhToolbarGroup>
      <XhToolbarSeparator />
      <XhToolbarItem value="more" type="button">更多</XhToolbarItem>
    </XhToolbarRoot>
  );
}
