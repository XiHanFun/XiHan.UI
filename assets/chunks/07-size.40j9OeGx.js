const e=`// 尺寸 | 不传 size 即默认档；触发框与列里的条目一起换档
import type { Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/react";

const sizes: { size: Size | undefined; label: string }[] = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];

const regions = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [{ value: "nanjing", label: "南京" }],
  },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px" }}>
      {sizes.map(s => (
        <XhCascaderRoot
          key={s.label}
          size={s.size}
          collection={regions}
          placeholder="请选择地区"
        >
          {({ levels }) => (
            <>
              <XhCascaderLabel>{s.label}</XhCascaderLabel>
              <XhCascaderControl>
                <XhCascaderTrigger>
                  <XhCascaderValueText />
                  <XhCascaderIndicator />
                </XhCascaderTrigger>
              </XhCascaderControl>
              <XhCascaderPositioner>
                <XhCascaderContent>
                  {levels.map(lv => (
                    <XhCascaderColumn key={lv.level} level={lv.level}>
                      {lv.items.map(node => (
                        <XhCascaderItem key={node.value} value={node.value}>
                          <XhCascaderItemText>{node.label}</XhCascaderItemText>
                          <XhCascaderItemIndicator />
                        </XhCascaderItem>
                      ))}
                    </XhCascaderColumn>
                  ))}
                </XhCascaderContent>
              </XhCascaderPositioner>
            </>
          )}
        </XhCascaderRoot>
      ))}
    </div>
  );
}
`;export{e as default};
