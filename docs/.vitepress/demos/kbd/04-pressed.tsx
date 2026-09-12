// 按下 | 展示动作激活时的键帽状态
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhKbd value="Enter" pressed />;
}
