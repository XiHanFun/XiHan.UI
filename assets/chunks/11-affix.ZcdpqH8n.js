const e=`// 框内前后缀 | 前后缀与输入框同在 control 这一个框里排成一行，共用它的描边与底色
import type { CSSProperties, ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

// 不参与分宽，也不吃指针事件：点在前后缀上仍然落到输入框里
const affix: CSSProperties = { flex: "none", color: "var(--xh-fg-muted)", pointerEvents: "none" };

export default function Demo(): ReactNode {
  return (
    <>
      <XhTextFieldRoot placeholder="0.00">
        <XhTextFieldLabel>金额</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "200px" }}>
          <span style={affix}>¥</span>
          <XhTextFieldInput inputMode="decimal" />
          <span style={affix}>元</span>
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot placeholder="170">
        <XhTextFieldLabel>身高</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "160px" }}>
          <XhTextFieldInput inputMode="numeric" />
          <span style={affix}>cm</span>
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </>
  );
}
`;export{e as default};
