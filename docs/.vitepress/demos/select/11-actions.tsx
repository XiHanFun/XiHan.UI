// 操作入口 | 通过插槽状态控制开合和值
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

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];

export default function Demo(): ReactNode {
  return (
    <XhSelectRoot placeholder="请选择">
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
  );
}
