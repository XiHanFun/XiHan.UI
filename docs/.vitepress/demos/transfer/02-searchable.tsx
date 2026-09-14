// 搜索过滤 | searchable 给每侧配一个搜索框，筛剩下的才参与方向键、全选与搬运
import type { TransferItem } from "@xihan-ui/headless";
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
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangzhou", label: "广州" },
  { value: "shenzhen", label: "深圳" },
  { value: "hangzhou", label: "杭州" },
  { value: "chengdu", label: "成都" },
  { value: "wuhan", label: "武汉" },
  { value: "xian", label: "西安" },
];

// 默认按标签大小写不敏感包含匹配，这里换成同时认拼音代号
function filter(item: TransferItem, query: string): boolean {
  const q = query.toLowerCase();
  return item.label.includes(query) || item.value.includes(q);
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "520px" }}>
      <XhTransferRoot
        value={value}
        collection={items}
        filter={filter}
        searchable
        onValueChange={details => setValue(details.value)}
      >
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            {/* 搜索框没有可见标签，借本侧标题当可及名字，标题因此不能省 */}
            <XhTransferPanelTitle>待选城市</XhTransferPanelTitle>
            <XhTransferPanelCount />
            <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索，也认 beijing" />
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
            <XhTransferPanelTitle>已选城市</XhTransferPanelTitle>
            <XhTransferPanelCount />
            <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
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
  );
}
