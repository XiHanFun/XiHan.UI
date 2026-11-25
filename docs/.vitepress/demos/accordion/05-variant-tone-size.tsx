// 形态、语气与尺寸 | 形态只改变与页面分开的方式：ghost 不绘制外壳，outline 连成单一表面，subtle 用淡底；tone 落在展开态的标题上；size 改变标题栏的高度、内边距与字号
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";

const variants = ["ghost", "outline", "subtle"] as const;

const variantPanels = [
  { value: "shipping", label: "配送方式", content: "下单后 48 小时内发出。" },
  { value: "refund", label: "退换政策", content: "签收 7 天内可申请退换。" },
];

const tones = ([
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const).map(tone => ({
  ...tone,
  panels: [
    {
      value: "open",
      label: `${tone.label}（展开）`,
      content: `tone="${tone.value}"`,
    },
    {
      value: "closed",
      label: `${tone.label}（收起）`,
      content: "收起态标题保持默认颜色。",
    },
  ],
}));

const another = {
  value: "b",
  label: "另一项",
  content: "同一档内所有标题一致。",
};

// 中间一档不写 size，用 undefined 表达
const sizes = [
  {
    size: "sm" as const,
    key: "sm",
    panels: [
      { value: "a", label: "小号 sm", content: "标题栏最矮，字号也最小。" },
      another,
    ],
  },
  {
    size: undefined,
    key: "md",
    panels: [
      { value: "a", label: "缺省档", content: "不写 size 就是这一档。" },
      another,
    ],
  },
  {
    size: "lg" as const,
    key: "lg",
    panels: [
      { value: "a", label: "大号 lg", content: "标题栏最高，字号也最大。" },
      another,
    ],
  },
];

const row = {
  display: "grid",
  gap: "var(--xh-space-4)",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)", width: "100%" }}>
      <div style={row}>
        {variants.map(variant => (
          <XhAccordionRoot
            key={variant}
            variant={variant}
            collection={variantPanels}
            defaultValue={["shipping"]}
          />
        ))}
      </div>

      <div style={row}>
        {tones.map(tone => (
          <XhAccordionRoot
            key={tone.value}
            tone={tone.value}
            collection={tone.panels}
            defaultValue={["open"]}
          />
        ))}
      </div>

      <div style={{ ...row, alignItems: "start" }}>
        {sizes.map(group => (
          <XhAccordionRoot
            key={group.key}
            size={group.size}
            collection={group.panels}
            defaultValue={["a"]}
          />
        ))}
      </div>
    </div>
  );
}
