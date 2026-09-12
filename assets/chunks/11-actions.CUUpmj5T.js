const e=`// 插槽里的操作入口 | 根部件把 open、value 与 setOpen、setValue 交给插槽，浮层之外的按钮据此展开或清空
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
  { value: "cherry", label: "樱桃" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        placeholder="请选择"
      >
        {({ open, value, setOpen, setValue }) => (
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
            <div style={{ display: "flex", gap: "8px", marginBlockStart: "8px" }}>
              <XhButton variant="outline" size="sm" onClick={() => setOpen(!open)}>
                {open ? "收起" : "展开"}
              </XhButton>
              <XhButton variant="ghost" size="sm" disabled={value.length === 0} onClick={() => setValue([])}>
                清空
              </XhButton>
            </div>
          </>
        )}
      </XhSelectRoot>
      <p>
        当前值：
        {picked[0] ?? "（未选）"}
      </p>
    </>
  );
}
`;export{e as default};
