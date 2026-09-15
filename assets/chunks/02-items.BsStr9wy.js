const e=`// 手写格子 | 不交数据也行：每格自己报 value，名字与禁用写在格子上；半透明颜色铺在棋盘格上
import type { ReactNode } from "react";
import { XhColorSwatchPickerItem, XhColorSwatchPickerLabel, XhColorSwatchPickerRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("rgb(225, 29, 72)");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <XhColorSwatchPickerRoot value={value} onValueChange={details => setValue(details.value)}>
        <XhColorSwatchPickerLabel>高亮色</XhColorSwatchPickerLabel>
        <XhColorSwatchPickerItem value="#e11d48" label="玫红" />
        <XhColorSwatchPickerItem value="#e11d4880" label="半透明玫红" />
        <XhColorSwatchPickerItem value="#f59e0b" label="琥珀" disabled />
        <XhColorSwatchPickerItem value="hsl(217 91% 60%)" label="天蓝" />
      </XhColorSwatchPickerRoot>
      <span style={{ fontSize: "13px" }}>
        当前：
        <code>{value ?? "（未选）"}</code>
      </span>
    </div>
  );
}
`;export{e as default};
