const n=`// 侧栏宽度 | 展开与折叠各一档宽度，两档都接受任意 CSS 长度，切换时按皮肤里的过渡走
import type { ReactNode } from "react";
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhLayoutRoot
      siderWidth="220px"
      siderCollapsedWidth="56px"
      bordered
      style={{ blockSize: "220px", borderRadius: "8px", overflow: "hidden" }}
    >
      <XhLayoutHeader>
        <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
        <span>220px ⇄ 56px</span>
      </XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent>
        只写其中一档时，另一档仍取皮肤里的缺省宽度。
      </XhLayoutContent>
    </XhLayoutRoot>
  );
}
`;export{n as default};
