// 可访问名称 | 为独立图标提供名称
import type { ReactNode } from "react";
import { XIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhIcon icon={XIcon} label="关闭" />;
}
