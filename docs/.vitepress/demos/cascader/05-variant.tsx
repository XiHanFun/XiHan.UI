// 形态 | variant 只改触发框的底色与描边用法，浮层与列不跟着变
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

const variants = ["outline", "subtle", "ghost"] as const;

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
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {variants.map(v => (
        <XhCascaderRoot
          key={v}
          variant={v}
          collection={regions}
          placeholder="请选择地区"
        >
          {({ levels }) => (
            <>
              <XhCascaderLabel>{v}</XhCascaderLabel>
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
