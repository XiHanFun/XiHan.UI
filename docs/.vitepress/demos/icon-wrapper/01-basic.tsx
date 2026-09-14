// 基础用法 | 显示带背景的图标
import type { ReactNode } from "react";
import { BellIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhIconWrapper>
      <XhIcon icon={BellIcon} />
    </XhIconWrapper>
  );
}
