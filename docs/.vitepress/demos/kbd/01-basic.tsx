// 基础用法 | 单枚原生 kbd，只显示键名，不注册快捷键
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      按 <XhKbd value="Escape" /> 关闭当前面板
    </p>
  );
}
