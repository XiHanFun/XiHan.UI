const e=`// 区分大小写 | 默认不区分，开启 case-sensitive 后按写法比较
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
`;export{e as default};
