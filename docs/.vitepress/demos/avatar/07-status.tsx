// 加载状态 | status-change 在状态落位时通知，过渡态 idle 不通知；没给地址等同于取不到，直接落 error 让回退接管
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";
import { useState } from "react";

const cases = [
  { key: "ok", src: "/images/logo.png", alt: "曦寒", text: "曦", note: "地址有效" },
  { key: "bad", src: "/images/does-not-exist.png", alt: "取不到的图", text: "回退", note: "地址取不到" },
  { key: "none", src: undefined, alt: undefined, text: "无图", note: "没给地址" },
];

export default function Demo(): ReactNode {
  const [status, setStatus] = useState<Record<string, string>>({});

  function record(key: string, details: { status: string }): void {
    setStatus(prev => ({ ...prev, [key]: details.status }));
  }

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      {cases.map(c => (
        <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <XhAvatarRoot src={c.src} alt={c.alt} onStatusChange={details => record(c.key, details)}>
            <XhAvatarImage />
            <XhAvatarFallback>{c.text}</XhAvatarFallback>
          </XhAvatarRoot>
          <span style={{ fontSize: "13px" }}>{`${c.note} → ${status[c.key] ?? "等待中"}`}</span>
        </div>
      ))}
    </div>
  );
}
