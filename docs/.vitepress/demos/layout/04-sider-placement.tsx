// 侧栏位置 | sider-placement 决定侧栏挂在行首还是行尾，分隔线也跟着换到挨内容的那一边
import type { ReactNode } from "react";
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <XhLayoutRoot
        siderPlacement="start"
        bordered
        style={{ blockSize: "160px", borderRadius: "8px", overflow: "hidden" }}
      >
        <XhLayoutHeader>侧栏在行首</XhLayoutHeader>
        <XhLayoutSider>导航</XhLayoutSider>
        <XhLayoutContent>正文</XhLayoutContent>
      </XhLayoutRoot>

      <XhLayoutRoot
        siderPlacement="end"
        bordered
        style={{ blockSize: "160px", borderRadius: "8px", overflow: "hidden" }}
      >
        <XhLayoutHeader>侧栏在行尾</XhLayoutHeader>
        <XhLayoutSider>属性面板</XhLayoutSider>
        <XhLayoutContent>正文</XhLayoutContent>
      </XhLayoutRoot>
    </div>
  );
}
