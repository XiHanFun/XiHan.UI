const l=`// 尺寸 | size 换的是触发按钮的高度、内边距与字号，三档并排对照
import type { ReactNode } from "react";
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        alignItems: "start",
      }}
    >
      <XhCollapsibleRoot size="sm" defaultOpen>
        <XhCollapsibleTrigger>小号 sm</XhCollapsibleTrigger>
        <XhCollapsibleContent>按钮最矮，字号也最小。</XhCollapsibleContent>
      </XhCollapsibleRoot>

      <XhCollapsibleRoot defaultOpen>
        <XhCollapsibleTrigger>缺省档</XhCollapsibleTrigger>
        <XhCollapsibleContent>不写 size 就是这一档。</XhCollapsibleContent>
      </XhCollapsibleRoot>

      <XhCollapsibleRoot size="lg" defaultOpen>
        <XhCollapsibleTrigger>大号 lg</XhCollapsibleTrigger>
        <XhCollapsibleContent>按钮最高，字号也最大。</XhCollapsibleContent>
      </XhCollapsibleRoot>
    </div>
  );
}
`;export{l as default};
