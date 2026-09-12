// 字段横排 | 一行里摆多个字段：每个字段自成一块，谁跟谁排一行是外层容器的事
import type { ReactNode } from "react";
import { XhFieldControl, XhFieldLabel, XhFieldRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 外层给一行的排布，宽度逐个字段自己定
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "12px" }}>
      <XhFieldRoot style={{ inlineSize: "160px" }}>
        <XhFieldLabel>姓名</XhFieldLabel>
        <XhFieldControl>
          <input placeholder="请输入姓名" />
        </XhFieldControl>
      </XhFieldRoot>

      <XhFieldRoot style={{ inlineSize: "96px" }}>
        <XhFieldLabel>年龄</XhFieldLabel>
        <XhFieldControl>
          <input type="number" placeholder="18" />
        </XhFieldControl>
      </XhFieldRoot>

      <XhFieldRoot style={{ inlineSize: "180px" }}>
        <XhFieldLabel>电话</XhFieldLabel>
        <XhFieldControl>
          <input type="tel" placeholder="请输入电话" />
        </XhFieldControl>
      </XhFieldRoot>
    </div>
  );
}
