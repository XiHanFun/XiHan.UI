// 受控 | 传了 sider-collapsed 就由宿主说了算，组件不再自改，只发 sider-collapsed-change
import type { ReactNode } from "react";
import {
  XhButton,
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhButton size="sm" onClick={() => setCollapsed(!collapsed)}>
        {`从外面${collapsed ? "展开" : "收起"}`}
      </XhButton>

      <XhLayoutRoot
        siderCollapsed={collapsed}
        onSiderCollapsedChange={details => setCollapsed(details.collapsed)}
        bordered
        style={{ blockSize: "220px", borderRadius: "8px", overflow: "hidden" }}
      >
        <XhLayoutHeader>
          <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
          <span>{`当前：${collapsed ? "已折叠" : "已展开"}`}</span>
        </XhLayoutHeader>
        <XhLayoutSider>导航</XhLayoutSider>
        <XhLayoutContent>
          把手与上面那个按钮改的是同一份状态。
        </XhLayoutContent>
      </XhLayoutRoot>
    </div>
  );
}
