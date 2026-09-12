// 垂直布局 | 按纵向排列工具
import type { ReactNode } from "react";
import { MaximizeIcon, ZoomInIcon, ZoomOutIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToolbarRoot orientation="vertical" aria-label="画布缩放">
      <XhToolbarItem value="zoom-in" type="button">
        <XhIcon icon={ZoomInIcon} />
        放大
      </XhToolbarItem>
      <XhToolbarItem value="zoom-out" type="button">
        <XhIcon icon={ZoomOutIcon} />
        缩小
      </XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="fit" type="button">
        <XhIcon icon={MaximizeIcon} />
        适应画布
      </XhToolbarItem>
    </XhToolbarRoot>
  );
}
