// 异步提交 | 受控开关在回执到达前不落位；loading 让提交期呈现为「处理中」而非禁用——交互挂起、滑块转圈、仍可聚焦
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);

  // 回执到达才写回 checked，中途开关停在旧值上
  function onCheckedChange(details: { checked: boolean }): void {
    setPending(true);
    setTimeout(() => {
      setEnabled(details.checked);
      setPending(false);
    }, 900);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <XhSwitch checked={enabled} loading={pending} onCheckedChange={onCheckedChange} />
      <span>{pending ? "提交中…" : enabled ? "已开启" : "已关闭"}</span>
    </div>
  );
}
