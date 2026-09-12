// 基础用法 | 一组组合的键帽：Mod 在 Mac 上出 ⌘、其余平台出 Ctrl，平台由组件自己测出来
import type { ReactNode } from "react";
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {/* 展示与注册显式组合；Hotkeys 自身不渲染 DOM */}
      <XhKbdGroup keys={["Mod", "S"]} />
      <XhHotkeys keys={["Mod", "S"]} onHotKey={() => setCount(previous => previous + 1)} />
      <span>{`已按下 ${count} 次`}</span>
    </div>
  );
}
