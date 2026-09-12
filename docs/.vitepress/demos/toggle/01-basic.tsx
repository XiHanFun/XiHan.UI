// 基础用法 | 切换点赞状态
import type { ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToggle>
      <XhIcon icon={HeartIcon} />
      点赞
    </XhToggle>
  );
}
