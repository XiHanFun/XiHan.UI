// 启用状态 | 动态启用或暂停监听
import type { ReactNode } from "react";
import { XhHotkeys } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [enabled, setEnabled] = useState(true);
  const [count, setCount] = useState(0);
  return (
    <>
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} />
        启用 Mod + B
      </label>
      <XhHotkeys keys={["Mod", "B"]} enabled={enabled} onHotKey={() => setCount(value => value + 1)} />
      <output>{count ? `已触发 ${count} 次` : "等待输入"}</output>
    </>
  );
}
