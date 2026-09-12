const n=`// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

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
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {tones.map(t => (
        <XhCascaderRoot
          key={t}
          variant="subtle"
          tone={t}
          collection={regions}
          placeholder="请选择地区"
        >
          {({ levels }) => (
            <>
              <XhCascaderLabel>{t}</XhCascaderLabel>
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
`;export{n as default};
