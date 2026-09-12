const e=`// 侧栏覆盖档 | sider-presentation="sheet" 把侧栏移出画外，唤出来时盖在内容之上；点遮罩或按 Escape 收起
import type { ReactNode } from "react";
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderBackdrop,
  XhLayoutSiderTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhLayoutRoot
      bordered
      defaultSiderCollapsed
      siderPresentation="sheet"
      style={{ blockSize: "240px", borderRadius: "8px", overflow: "hidden" }}
    >
      <XhLayoutHeader>
        <XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger>
        <span>控制台</span>
      </XhLayoutHeader>
      <XhLayoutSiderBackdrop />
      <XhLayoutSider>导航 · 收藏 · 回收站</XhLayoutSider>
      <XhLayoutContent>
        覆盖档下侧栏不占列，内容占满整宽；面板贴住视口那条边升起来。
      </XhLayoutContent>
    </XhLayoutRoot>
  );
}
`;export{e as default};
