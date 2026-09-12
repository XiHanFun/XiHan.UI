const e=`// 必填标记 | required 落成 data-required，皮肤据此给组标题加星号；星号只是视觉冗余，必填这件事要一并写进文案
import type { ReactNode } from "react";
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFieldsetRoot required style={{ inlineSize: "320px" }}>
      <XhFieldsetLegend>配送时段</XhFieldsetLegend>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input type="radio" name="fieldset-slot" value="am" />
        上午（9:00–12:00）
      </label>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input type="radio" name="fieldset-slot" value="pm" />
        下午（13:00–18:00）
      </label>
      <XhFieldsetDescription>必选一项，下单后不可更改</XhFieldsetDescription>
    </XhFieldsetRoot>
  );
}
`;export{e as default};
