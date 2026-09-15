const e=`// 列表分组 | 本侧此刻看得见的条目由组件给出，据此分组渲染；group 是 role=group 的段落壳，段标题不入方向键也不入搬运
import type { TransferItem } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhTransferGroup,
  XhTransferGroupLabel,
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

const groups = [
  { key: "read", label: "读取" },
  { key: "write", label: "写入" },
  { key: "admin", label: "管理" },
];

const permissions = [
  { value: "list", label: "查看列表", group: "read" },
  { value: "detail", label: "查看详情", group: "read" },
  { value: "export", label: "导出数据", group: "read" },
  { value: "create", label: "新建", group: "write" },
  { value: "update", label: "编辑", group: "write" },
  { value: "remove", label: "删除", group: "write" },
  { value: "grant", label: "授权", group: "admin" },
  { value: "audit", label: "审计", group: "admin" },
];

// 面板插槽给的条目只带 value / label，分组信息回自己那份数据里查
function inGroup(list: readonly TransferItem[], group: string): TransferItem[] {
  return list.filter(item =>
    permissions.some(p => p.value === item.value && p.group === group),
  );
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["list"]);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "520px" }}>
      <XhTransferRoot
        value={value}
        collection={permissions}
        searchable
        onValueChange={details => setValue(details.value)}
      >
        <XhTransferSourcePanel>
          {({ items }) => (
            <>
              <XhTransferPanelHeader>
                <XhTransferPanelTitle>可授予</XhTransferPanelTitle>
                <XhTransferPanelCount />
              </XhTransferPanelHeader>
              <XhTransferSearch placeholder="搜索" />
              <XhTransferList>
                {groups.map(g => (
                  <XhTransferGroup key={g.key} value={g.key}>
                    <XhTransferGroupLabel>{g.label}</XhTransferGroupLabel>
                    {inGroup(items, g.key).map(item => (
                      <XhTransferItem key={item.value} value={item.value}>
                        <XhTransferItemCheckbox />
                        <XhTransferItemText>{item.label}</XhTransferItemText>
                      </XhTransferItem>
                    ))}
                  </XhTransferGroup>
                ))}
              </XhTransferList>
            </>
          )}
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          {({ items }) => (
            <>
              <XhTransferPanelHeader>
                <XhTransferPanelTitle>已授予</XhTransferPanelTitle>
                <XhTransferPanelCount />
              </XhTransferPanelHeader>
              <XhTransferSearch placeholder="搜索" />
              <XhTransferList>
                {groups.map(g => (
                  <XhTransferGroup key={g.key} value={g.key}>
                    <XhTransferGroupLabel>{g.label}</XhTransferGroupLabel>
                    {inGroup(items, g.key).map(item => (
                      <XhTransferItem key={item.value} value={item.value}>
                        <XhTransferItemCheckbox />
                        <XhTransferItemText>{item.label}</XhTransferItemText>
                      </XhTransferItem>
                    ))}
                  </XhTransferGroup>
                ))}
              </XhTransferList>
            </>
          )}
        </XhTransferTargetPanel>
      </XhTransferRoot>
    </div>
  );
}
`;export{e as default};
