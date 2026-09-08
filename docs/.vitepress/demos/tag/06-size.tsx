// 尺寸 | size 只改内边距、间距与字号，不写就是缺省档；关闭钮的命中区不跟着缩
import type { ReactNode } from "react";
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      <XhTagRoot variant="subtle" size="sm" closable>
        <XhTagLabel>小</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
      <XhTagRoot variant="subtle" closable>
        <XhTagLabel>缺省</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
      <XhTagRoot variant="subtle" size="lg" closable>
        <XhTagLabel>大</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
    </div>
  );
}
