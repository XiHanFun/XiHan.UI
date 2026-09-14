// 区分大小写 | 缺省不区分，开了 case-sensitive 就按写法比
import type { ReactNode } from "react";
import { XhHighlight } from "@xihan-ui/react";

const text = "XiHan UI 与 xihan ui 是同一个名字的两种写法。";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <XhHighlight text={text} keyword="ui" />
      <XhHighlight text={text} keyword="ui" caseSensitive />
    </div>
  );
}
