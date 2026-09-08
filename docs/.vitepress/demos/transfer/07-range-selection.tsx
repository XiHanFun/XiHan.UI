// 范围选 | 按住 Shift 点某一项，选中锚点到它那一段；锚点跨到另一侧时退化成普通勾选
import type { ReactNode } from "react";
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
  { value: "delete", label: "删除" },
  { value: "export", label: "导出" },
  { value: "audit", label: "审计" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["read"]);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "520px" }}>
      <p style={{ marginBlockEnd: "12px", color: "var(--xh-fg-muted)" }}>
        点左侧第一项，再
        <strong>按住 Shift</strong>
        {" 点更下面的一项 —— 中间整段一起勾上。两侧是各自独立的列表，锚点跨到另一侧时退化成普通勾选。"}
      </p>
      <XhTransferRoot
        value={value}
        collection={items}
        onValueChange={details => setValue(details.value)}
      >
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferList>
            {/* 两侧各挂一份全集，不属于本侧的那一份由组件打上 hidden，不卸载节点 */}
            {items.map(item => (
              <XhTransferItem key={item.value} value={item.value}>
                <XhTransferItemCheckbox />
                <XhTransferItemText>{item.label}</XhTransferItemText>
              </XhTransferItem>
            ))}
          </XhTransferList>
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferList>
            {items.map(item => (
              <XhTransferItem key={item.value} value={item.value}>
                <XhTransferItemCheckbox />
                <XhTransferItemText>{item.label}</XhTransferItemText>
              </XhTransferItem>
            ))}
          </XhTransferList>
        </XhTransferTargetPanel>
      </XhTransferRoot>

      <p style={{ marginBlockStart: "12px", fontSize: "13px" }}>
        {`已选：${value.length ? value.join("、") : "（无）"}`}
      </p>
    </div>
  );
}
