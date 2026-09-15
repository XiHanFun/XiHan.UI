const e=`// 整块换档 | 面板高度、表头、条目行、勾选格与搬运按钮各是一个令牌，写在根上整块一起换档
import type { CSSProperties, ReactNode } from "react";
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
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

// 一档尺寸就是一组令牌：两栏间距、面板高度、表头、搜索框、条目、勾选格与搬运按钮
const compact = {
  "--xh-transfer-gap": "8px",
  "--xh-transfer-list-h": "7rem",
  "--xh-transfer-panel-header-py": "2px",
  "--xh-transfer-panel-title-font-size": "12px",
  "--xh-transfer-search-h": "26px",
  "--xh-transfer-search-font-size": "12px",
  "--xh-transfer-item-py": "1px",
  "--xh-transfer-item-font-size": "12px",
  "--xh-transfer-checkbox-size": "13px",
  "--xh-transfer-checkbox-font-size": "10px",
  "--xh-transfer-trigger-size": "22px",
  "--xh-transfer-trigger-font-size": "12px",
} as CSSProperties;
const roomy = {
  "--xh-transfer-gap": "20px",
  "--xh-transfer-list-h": "14rem",
  "--xh-transfer-panel-header-py": "10px",
  "--xh-transfer-panel-title-font-size": "16px",
  "--xh-transfer-search-h": "40px",
  "--xh-transfer-search-font-size": "16px",
  "--xh-transfer-item-py": "6px",
  "--xh-transfer-item-font-size": "16px",
  "--xh-transfer-checkbox-size": "20px",
  "--xh-transfer-checkbox-font-size": "14px",
  "--xh-transfer-trigger-size": "36px",
  "--xh-transfer-trigger-font-size": "16px",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [tight, setTight] = useState<string[]>(["read"]);
  const [loose, setLoose] = useState<string[]>(["read"]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        inlineSize: "100%",
        maxInlineSize: "520px",
      }}
    >
      <div>
        <p style={{ marginBlockEnd: "8px", fontSize: "13px" }}>紧凑</p>
        <XhTransferRoot
          value={tight}
          collection={items}
          searchable
          style={compact}
          onValueChange={details => setTight(details.value)}
        >
          <XhTransferSourcePanel>
            <XhTransferPanelHeader>
              <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
              <XhTransferPanelCount />
            </XhTransferPanelHeader>
            <XhTransferSearch placeholder="搜索" />
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
              <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
              <XhTransferPanelCount />
            </XhTransferPanelHeader>
            <XhTransferSearch placeholder="搜索" />
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

      <div>
        <p style={{ marginBlockEnd: "8px", fontSize: "13px" }}>宽松</p>
        <XhTransferRoot
          value={loose}
          collection={items}
          searchable
          style={roomy}
          onValueChange={details => setLoose(details.value)}
        >
          <XhTransferSourcePanel>
            <XhTransferPanelHeader>
              <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
              <XhTransferPanelCount />
            </XhTransferPanelHeader>
            <XhTransferSearch placeholder="搜索" />
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
              <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
              <XhTransferPanelCount />
            </XhTransferPanelHeader>
            <XhTransferSearch placeholder="搜索" />
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
    </div>
  );
}
`;export{e as default};
