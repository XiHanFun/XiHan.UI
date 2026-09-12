// 禁用 | 展示状态由作者显式给出，不从 Hotkeys enabled 暗中推导
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhKbdGroup keys={["Mod", "S"]} disabled />;
}
