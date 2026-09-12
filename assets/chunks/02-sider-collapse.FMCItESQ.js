const e=`// 折叠侧栏 | 不传 sider-collapsed 即为非受控，把手按下去只改宽度，侧栏节点一直在
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
      bordered
      style={{ blockSize: "240px", borderRadius: "8px", overflow: "hidden" }}
    >
      <XhLayoutHeader>
        <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
        <span>控制台</span>
      </XhLayoutHeader>
      <XhLayoutSider>导航 · 收藏 · 回收站</XhLayoutSider>
      <XhLayoutContent>
        折起来的是宽度不是高度，侧栏里的滚动位置与输入框都留着。
      </XhLayoutContent>
    </XhLayoutRoot>
  );
}
`;export{e as default};
