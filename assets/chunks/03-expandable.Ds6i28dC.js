const n=`// 展开全文 | 真被裁了才在文字之后露出一颗展开按钮；文字本身照常可选中，展开与收起只归按钮管
import type { ReactNode } from "react";
import { XhTruncate } from "@xihan-ui/react";

const translations = { expand: "展开", collapse: "收起" };

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTruncate lines={2} expandable translations={translations}>
        本次更新改进了组件主题、键盘交互与响应式布局。按下文字下方的按钮可查看完整内容，再按一次即可收起。
      </XhTruncate>
    </div>
  );
}
`;export{n as default};
