const e=`// 基础用法 | collection 是条目全集的唯一事实源，value 只装落在右侧的那批
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
        {\`已选：\${value.length ? value.join("、") : "（无）"}\`}
      </p>
    </div>
  );
}
`;export{e as default};
