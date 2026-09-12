const o=`// 整组换一档尺寸 | 高度、内边距与字号各是一个组件令牌，写在 root 上由整组条目继承，不必逐个条目改
import type { CSSProperties, ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

// 三个槽位一起换档，取的是控件尺寸家族里的同一档，跟同页别的控件对得上
const sm = {
  "--xh-toggle-group-item-h": "var(--xh-control-h-sm)",
  "--xh-toggle-group-item-px": "var(--xh-control-px-sm)",
  "--xh-toggle-group-item-font-size": "var(--xh-font-size-sm)",
} as CSSProperties;

const lg = {
  "--xh-toggle-group-item-h": "var(--xh-control-h-lg)",
  "--xh-toggle-group-item-px": "var(--xh-control-px-lg)",
  "--xh-toggle-group-item-font-size": "var(--xh-font-size-lg)",
} as CSSProperties;

const spans = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggleGroupRoot collection={spans} defaultValue="day" style={sm} />

      {/* 不写就是缺省档 */}
      <XhToggleGroupRoot collection={spans} defaultValue="week" />

      <XhToggleGroupRoot collection={spans} defaultValue="month" style={lg} />
    </>
  );
}
`;export{o as default};
