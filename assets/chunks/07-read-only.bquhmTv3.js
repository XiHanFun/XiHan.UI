const a=`// 只读 | readOnly 只锁关闭钮：叉留在原地但按不动，标签本身不置灰；与 disabled 的区别只在标签本体的颜色
import type { ReactNode } from "react";
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      <XhTagRoot variant="subtle" tone="brand" closable>
        <XhTagLabel>可摘掉</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>

      <XhTagRoot variant="subtle" tone="brand" closable readOnly>
        <XhTagLabel>只读</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>

      <XhTagRoot variant="subtle" tone="brand" closable disabled>
        <XhTagLabel>禁用</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
    </div>
  );
}
`;export{a as default};
