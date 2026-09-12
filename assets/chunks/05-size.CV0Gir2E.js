const t=`// 尺寸 | size 换的是条目的内边距、图文间距与两行文字的字号，不传 size 即默认档
import type { ReactNode } from "react";
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "16px" }}>
      {sizes.map(s => (
        <XhListRoot
          key={s.label}
          size={s.size}
          bordered
          split
          style={{ inlineSize: "200px" }}
        >
          <XhListItem>
            <XhListItemContent>
              <XhListItemTitle>{s.label}</XhListItemTitle>
              <XhListItemDescription>说明文字</XhListItemDescription>
            </XhListItemContent>
          </XhListItem>
          <XhListItem>
            <XhListItemContent>
              <XhListItemTitle>第二条</XhListItemTitle>
              <XhListItemDescription>说明文字</XhListItemDescription>
            </XhListItemContent>
          </XhListItem>
        </XhListRoot>
      ))}
    </div>
  );
}
`;export{t as default};
