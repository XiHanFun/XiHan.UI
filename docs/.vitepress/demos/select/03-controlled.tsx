// 受控 | 由 value 和 value-change 控制；外部按钮经插槽状态的 setOpen 与 setValue 开合与清空，改值同样经 value-change 回到宿主
import type { ReactNode } from "react";
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃（选不中）" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["banana"]);
  const [rejected, setRejected] = useState(false);

  // 只有通过校验的值才写回，未写回则界面停在原值
  function onValueChange(details: { value: string[] }): void {
    const bad = details.value.includes("cherry");
    setRejected(bad);
    if (!bad)
      setValue(details.value);
  }

  return (
    <>
      <XhSelectRoot value={value} placeholder="请选择" onValueChange={onValueChange}>
        {api => (
          <>
            <XhSelectLabel>水果</XhSelectLabel>
            <XhSelectControl>
              <XhSelectTrigger>
                <XhSelectValueText />
                <XhSelectIndicator />
              </XhSelectTrigger>
            </XhSelectControl>
            <XhSelectPositioner>
              <XhSelectContent>
                <XhSelectList>
                  {fruits.map(f => (
                    <XhSelectItem key={f.value} value={f.value}>
                      <XhSelectItemText>{f.label}</XhSelectItemText>
                      <XhSelectItemIndicator />
                    </XhSelectItem>
                  ))}
                </XhSelectList>
              </XhSelectContent>
            </XhSelectPositioner>
            <div style={{ display: "flex", gap: "var(--xh-space-2)", marginBlockStart: "var(--xh-space-2)" }}>
              <XhButton variant="outline" size="sm" onClick={() => api.setOpen(!api.open)}>
                {api.open ? "收起" : "展开"}
              </XhButton>
              <XhButton variant="ghost" size="sm" disabled={value.length === 0} onClick={() => api.setValue([])}>
                清空
              </XhButton>
            </div>
          </>
        )}
      </XhSelectRoot>
      <p data-demo-output>{`宿主持有的值：${value.join("、") || "（空）"}${rejected ? " · 上一次选择被拒绝" : ""}`}</p>
    </>
  );
}
