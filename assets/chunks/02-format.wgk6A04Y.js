const o=`// 写法与透明度 | 手动输入的任何写法提交后都按 format 重写；开启 alpha 才保留透明度，配合 rgba 写法一目了然
import type { ReactNode } from "react";
import {
  XhColorFieldControl,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("rgba(59, 130, 246, 0.5)");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* 试着打 #3b82f680 或 hsl(217 91% 60% / 50%)，收下后都变成 rgba() */}
      <XhColorFieldRoot value={value} onValueChange={details => setValue(details.value)} format="rgba" alpha placeholder="rgba(r, g, b, a)">
        <XhColorFieldLabel>遮罩色</XhColorFieldLabel>
        <XhColorFieldControl>
          <XhColorFieldSwatch />
          <XhColorFieldInput />
        </XhColorFieldControl>
      </XhColorFieldRoot>
      <span style={{ fontSize: "13px" }}>
        收下的值：
        <code>{value || "（空）"}</code>
      </span>
    </div>
  );
}
`;export{o as default};
