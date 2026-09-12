const e=`// 基础用法 | 控件由自己写，Field 只把属性并上去：标题的 for、控件的 id 与描述链（aria-describedby）自动对齐
import type { ReactNode } from "react";
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFieldRoot style={{ inlineSize: "280px" }}>
      <XhFieldLabel>邮箱</XhFieldLabel>
      <XhFieldControl>
        <input type="email" placeholder="you@example.com" />
      </XhFieldControl>
      <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
    </XhFieldRoot>
  );
}
`;export{e as default};
