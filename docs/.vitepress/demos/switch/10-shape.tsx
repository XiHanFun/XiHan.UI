// 形状 | 轨道与滑块共用同一个形状令牌，在实例上覆盖一次两者一起变方
import type { CSSProperties, ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhSwitch defaultChecked style={{ "--xh-shape-pill": "0" } as CSSProperties} />
        <span>直角</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhSwitch defaultChecked style={{ "--xh-shape-pill": "5px" } as CSSProperties} />
        <span>圆角</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhSwitch defaultChecked />
        <span>缺省</span>
      </span>
    </div>
  );
}
