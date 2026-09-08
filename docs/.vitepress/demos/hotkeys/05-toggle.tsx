// 开关监听 | enabled 关掉后组合不再触发，键帽也转成不可用的样子
import type { ReactNode } from "react";
import { XhHotkeys } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [enabled, setEnabled] = useState(true);
  const [hits, setHits] = useState(0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={event => setEnabled(event.target.checked)}
        />
        监听生效
      </label>
      <XhHotkeys
        keys={["Mod", "B"]}
        enabled={enabled}
        onHotKey={() => setHits(previous => previous + 1)}
      />
      <span>{`已触发 ${hits} 次`}</span>
    </div>
  );
}
