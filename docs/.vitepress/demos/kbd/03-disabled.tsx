// 禁用 | 表示对应动作不可用
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhKbd value="Delete" disabled />;
}
