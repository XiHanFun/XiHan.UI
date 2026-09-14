// 条目禁用 | 禁用写在 items 上：勾不动也搬不动，但仍可聚焦、仍是方向键的起点
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
  // 内置角色不许被挪走，禁用直接写在条目上
  { value: "owner", label: "所有者（内置）", disabled: true },
  { value: "delete", label: "删除" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["owner"]);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "520px" }}>
      <XhTransferRoot
        value={value}
        collection={items}
        onValueChange={details => setValue(details.value)}
      >
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>待选</XhTransferPanelTitle>
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
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>已选</XhTransferPanelTitle>
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
    </div>
  );
}
