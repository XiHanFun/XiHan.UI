// 条目自定义内容 | 条目里长什么样归作者：勾选格与文本各就各位，前后再各加一段自己的标记
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
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

// label 与 disabled 归组件读，其余字段是作者自己的，只用来渲染
const members = [
  { value: "lin", label: "林可", role: "前端工程师" },
  { value: "zhou", label: "周宁", role: "服务端工程师" },
  { value: "he", label: "何雨", role: "交互设计" },
  { value: "qin", label: "秦朗", role: "测试工程师" },
  { value: "xu", label: "许知", role: "产品经理" },
];

const avatarStyle: CSSProperties = {
  display: "inline-flex",
  flex: "none",
  inlineSize: "24px",
  blockSize: "24px",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "var(--xh-bg-subtle)",
  fontSize: "12px",
};

const textStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  minInlineSize: 0,
  flexDirection: "column",
};

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["he"]);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "560px" }}>
      <XhTransferRoot
        value={value}
        collection={members}
        onValueChange={details => setValue(details.value)}
      >
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>候选成员</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferList>
            {members.map(m => (
              <XhTransferItem key={m.value} value={m.value}>
                <XhTransferItemCheckbox />
                <span aria-hidden="true" style={avatarStyle}>
                  {m.label.slice(0, 1)}
                </span>
                <span style={textStyle}>
                  <XhTransferItemText>{m.label}</XhTransferItemText>
                  <span style={{ color: "var(--xh-fg-subtle)", fontSize: "12px" }}>{m.role}</span>
                </span>
              </XhTransferItem>
            ))}
          </XhTransferList>
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>项目组</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferList>
            {members.map(m => (
              <XhTransferItem key={m.value} value={m.value}>
                <XhTransferItemCheckbox />
                <span aria-hidden="true" style={avatarStyle}>
                  {m.label.slice(0, 1)}
                </span>
                <span style={textStyle}>
                  <XhTransferItemText>{m.label}</XhTransferItemText>
                  <span style={{ color: "var(--xh-fg-subtle)", fontSize: "12px" }}>{m.role}</span>
                </span>
              </XhTransferItem>
            ))}
          </XhTransferList>
        </XhTransferTargetPanel>
      </XhTransferRoot>
    </div>
  );
}
