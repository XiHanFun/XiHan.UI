// 语气 | tone 只换圆环起始边那一段颜色，轨道留在中性描边上，转到哪儿才看得出来
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {/* 语气名写在旁边的普通文字上，转圈自身的可及名字仍是"加载中" */}
      {tones.map(t => (
        <span
          key={t}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <XhSpinner tone={t} label="加载中" />
          <span style={{ fontSize: "13px" }}>{t}</span>
        </span>
      ))}
    </>
  );
}
