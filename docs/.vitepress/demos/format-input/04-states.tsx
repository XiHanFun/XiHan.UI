// 只读与禁用 | 只读时里面的控件可聚焦、可复制，不可修改；禁用时整组不可操作
import type { ReactNode } from "react";
import { XhFormatInputRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhFormatInputRoot readOnly defaultValue={{ kind: "number", decimals: 2, grouping: true }} aria-label="只读的金额格式" />
      <XhFormatInputRoot disabled defaultValue={{ kind: "percent", decimals: 1 }} aria-label="禁用的占比格式" />
    </>
  );
}
