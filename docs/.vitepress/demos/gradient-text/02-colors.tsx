// 两端颜色 | from 与 to 收颜色值，落成根上的 CSS 变量；写令牌或写具体色值都行
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

const pairs = [
  { from: "#ff5500", to: "#ff0088" },
  { from: "#00b8d9", to: "#6554c0" },
  { from: "var(--xh-color-success-500)", to: "var(--xh-color-info-600)" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "28px", fontWeight: 700 }}>
      {pairs.map(p => (
        <p key={p.from}>
          <XhGradientText from={p.from} to={p.to}>{`从 ${p.from} 渐到 ${p.to}`}</XhGradientText>
        </p>
      ))}
    </div>
  );
}
