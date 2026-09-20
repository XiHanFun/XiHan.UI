const n=`// 语气 | tone 只更换圆环起始边一段的颜色，轨道保持中性描边，旋转时才能看出差别
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
`;export{n as default};
