const e=`// 单向搬运 | oneWay 把往回搬那条路整个封死，右侧不再接受勾选，往回的按钮也就不必写
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
  XhTransferToTargetTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "cpu", label: "CPU 用量" },
  { value: "mem", label: "内存用量" },
  { value: "disk", label: "磁盘 IO" },
  { value: "net", label: "网络吞吐" },
  { value: "qps", label: "请求量" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "520px" }}>
      <XhTransferRoot
        value={value}
        collection={items}
        oneWay
        onValueChange={details => setValue(details.value)}
      >
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>可订阅指标</XhTransferPanelTitle>
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

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>已订阅</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferList>
            {/* 右侧的勾选格由组件自己隐去：这一侧勾不了任何东西 */}
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
`;export{e as default};
