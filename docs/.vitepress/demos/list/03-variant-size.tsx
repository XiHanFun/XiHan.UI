// 形态与尺寸 | variant 决定整份列表的外框：ghost 不画壳（缺省），outline 绘制一圈描边，subtle 用淡底；hoverable 使条目在指针悬停时更换底色；size 改变条目的内边距、图文间距与两行文字的字号，不传 size 即默认档
import type { ReactNode } from "react";
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/react";

const variants = ["ghost", "outline", "subtle"] as const;
const files = ["设计稿.fig", "接口文档.md", "会议纪要.docx"];

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "var(--xh-space-4)" }}>
        {variants.map(variant => (
          <XhListRoot key={variant} variant={variant} hoverable split style={{ inlineSize: "200px" }}>
            {files.map(file => (
              <XhListItem key={file}>
                <XhListItemContent>
                  <XhListItemTitle>{file}</XhListItemTitle>
                </XhListItemContent>
              </XhListItem>
            ))}
          </XhListRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "var(--xh-space-4)" }}>
        {sizes.map(s => (
          <XhListRoot
            key={s.label}
            size={s.size}
            variant="outline"
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
    </div>
  );
}
