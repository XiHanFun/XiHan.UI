const n=`// 标签左置 | 各部件都是独立节点，把根节点改成两列网格就能把标题挪到控件左边，说明与错误文案跟着对齐到控件那一列
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 第一列放标题，第二列放控件、说明与错误文案
    <XhFieldRoot
      invalid
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        alignItems: "center",
        columnGap: "12px",
        rowGap: "4px",
        inlineSize: "360px",
      }}
    >
      <XhFieldLabel>端口</XhFieldLabel>
      <XhFieldControl>
        <input defaultValue="abc" />
      </XhFieldControl>
      <XhFieldDescription style={{ gridColumnStart: 2 }}>留空表示使用默认端口</XhFieldDescription>
      <XhFieldErrorText style={{ gridColumnStart: 2 }}>端口只能是数字</XhFieldErrorText>
    </XhFieldRoot>
  );
}
`;export{n as default};
