// 限定范围 | target 写 parent 时只在组件所在的那一层容器里接组合，整页范围的组合不会互相抢
import type { ReactNode } from "react";
import { XhHotkeys } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [hits, setHits] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        border: "1px solid currentColor",
        borderRadius: "8px",
      }}
    >
      {/* 监听装在这一层容器上：焦点在框外时按同一组合不会触发 */}
      <input placeholder="在这里按 Mod+Enter" />
      <XhHotkeys
        keys={["Mod", "Enter"]}
        target="parent"
        onHotKey={() => setHits(previous => previous + 1)}
      />
      <span>{`框内已触发 ${hits} 次`}</span>
    </div>
  );
}
