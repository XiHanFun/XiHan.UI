var e=`// 自定义色相 | 语气之外的分类色：在标签上写 --xh-tag-bg / --xh-tag-fg / --xh-tag-border，从基础色板取同一色相的浅底深字；light-dark() 让暗色下换成深底浅字
import type { CSSProperties, ReactNode } from "react";
import { XhTagLabel, XhTagRoot } from "@xihan-ui/react";

// 同一色相取三档：浅底、深字、比底深一档的描边；暗色下对调
// 自定义属性不在 CSSProperties 的键里，样式按它断言
const tags = [
  { label: "前端", style: {
    "--xh-tag-bg": "light-dark(var(--xh-color-teal-100), var(--xh-color-teal-900))",
    "--xh-tag-fg": "light-dark(var(--xh-color-teal-800), var(--xh-color-teal-100))",
    "--xh-tag-border": "light-dark(var(--xh-color-teal-200), var(--xh-color-teal-800))",
  } as CSSProperties },
  { label: "设计", style: {
    "--xh-tag-bg": "light-dark(var(--xh-color-purple-100), var(--xh-color-purple-900))",
    "--xh-tag-fg": "light-dark(var(--xh-color-purple-800), var(--xh-color-purple-100))",
    "--xh-tag-border": "light-dark(var(--xh-color-purple-200), var(--xh-color-purple-800))",
  } as CSSProperties },
  { label: "运营", style: {
    "--xh-tag-bg": "light-dark(var(--xh-color-orange-100), var(--xh-color-orange-900))",
    "--xh-tag-fg": "light-dark(var(--xh-color-orange-800), var(--xh-color-orange-100))",
    "--xh-tag-border": "light-dark(var(--xh-color-orange-200), var(--xh-color-orange-800))",
  } as CSSProperties },
  { label: "数据", style: {
    "--xh-tag-bg": "light-dark(var(--xh-color-blue-100), var(--xh-color-blue-900))",
    "--xh-tag-fg": "light-dark(var(--xh-color-blue-800), var(--xh-color-blue-100))",
    "--xh-tag-border": "light-dark(var(--xh-color-blue-200), var(--xh-color-blue-800))",
  } as CSSProperties },
  { label: "内测", style: {
    "--xh-tag-bg": "light-dark(var(--xh-color-pink-100), var(--xh-color-pink-900))",
    "--xh-tag-fg": "light-dark(var(--xh-color-pink-800), var(--xh-color-pink-100))",
    "--xh-tag-border": "light-dark(var(--xh-color-pink-200), var(--xh-color-pink-800))",
  } as CSSProperties },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-2)" }}>
      {tags.map(tag => (
        <XhTagRoot key={tag.label} variant="subtle" style={tag.style}>
          <XhTagLabel>{tag.label}</XhTagLabel>
        </XhTagRoot>
      ))}
    </div>
  );
}
`;export{e as default};