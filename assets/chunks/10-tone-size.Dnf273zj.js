const e=`// 语气与尺寸 | tone 换勾选标记的色族，size 换条目行与勾选格的几何档；两轴打在根上，两侧面板一起走
import type { ReactNode } from "react";
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/react";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
];

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxInlineSize: "520px" }}>
      {rows.map(row => (
        <XhTransferRoot
          key={row.label}
          collection={items}
          defaultValue={["read"]}
          tone={row.tone}
          size={row.size}
        >
          <XhTransferSourcePanel>
            <XhTransferPanelHeader>
              <XhTransferPanelTitle>{\`待选 · \${row.label}\`}</XhTransferPanelTitle>
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
      ))}
    </div>
  );
}
`;export{e as default};
