const e=`// 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一块触发区，逐块右键对比
import type { ReactNode } from "react";
import { XhContextMenuRoot } from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "lg" },
] as const;

const commands = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

// 三块触发区共用一份外观，尺寸差别只由 size 造成
const triggerStyle = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "96px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  return (
    <div
      style={{
        inlineSize: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "12px",
      }}
    >
      {sizes.map(s => (
        <XhContextMenuRoot
          key={s.label}
          size={s.size}
          collection={commands}
          trigger={<span style={triggerStyle}>{s.label}</span>}
        />
      ))}
    </div>
  );
}
`;export{e as default};
