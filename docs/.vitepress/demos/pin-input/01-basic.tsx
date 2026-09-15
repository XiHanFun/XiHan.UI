// 基础用法 | 每格都是原生输入框，输入一个字符自动跳到下一格；粘贴整串会从落点格起按格铺开
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <XhPinInputRoot length={4} placeholder="·">
      <XhPinInputLabel>验证码</XhPinInputLabel>
      {/* 格间距长在格子自己身上，这层包裹只负责排成一行、不要再加 gap */}
      <div style={{ display: "flex" }}>
        {cells.map(i => <XhPinInputInput key={i} index={i} />)}
      </div>
    </XhPinInputRoot>
  );
}
