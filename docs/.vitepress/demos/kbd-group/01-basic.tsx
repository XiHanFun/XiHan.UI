// 基础用法 | 显示一组快捷键
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhKbdGroup keys={["Mod", "K"]} />;
}
