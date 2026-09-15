// 透明度 | 半透明颜色铺在棋盘格上，可以看出这是带透明度的颜色；三种写法解析为同一个颜色
import type { ReactNode } from "react";
import { XhColorSwatch } from "@xihan-ui/react";

// 同一个颜色的三种写法，与四档透明度
const values = ["#e11d48", "#e11d48bf", "rgba(225, 29, 72, 0.5)", "hsla(347, 77%, 50%, 0.25)"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      {values.map(value => (
        <span key={value} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <XhColorSwatch value={value} size="lg" />
          <code style={{ fontSize: "12px" }}>{value}</code>
        </span>
      ))}
    </div>
  );
}
