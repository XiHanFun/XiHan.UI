// 限定范围 | target 显式返回真实容器，只在这一层接组合
import type { ReactNode } from "react";
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [hits, setHits] = useState(0);
  const scope = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scope}
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
      <XhKbdGroup keys={["Mod", "Enter"]} />
      <XhHotkeys
        keys={["Mod", "Enter"]}
        target={() => scope.current}
        onHotKey={() => setHits(previous => previous + 1)}
      />
      <span>{`框内已触发 ${hits} 次`}</span>
    </div>
  );
}
