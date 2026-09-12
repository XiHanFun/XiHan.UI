const e=`// 级联勾选与回显策略 | multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛（默认只收叶），半选标记由条目自报的半选态出面
import type { ReactNode } from "react";
import {
  XhCascaderClearTrigger,
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
import { useState } from "react";

interface CatalogNode {
  value: string;
  label: string;
  children?: CatalogNode[];
}

const catalog: CatalogNode[] = [
  {
    value: "digital",
    label: "数码",
    children: [
      {
        value: "phone",
        label: "手机",
        children: [
          { value: "ios", label: "iOS" },
          { value: "android", label: "Android" },
        ],
      },
      {
        value: "laptop",
        label: "笔记本",
        children: [
          { value: "light", label: "轻薄本" },
          { value: "game", label: "游戏本" },
        ],
      },
    ],
  },
  {
    value: "home",
    label: "家居",
    children: [
      {
        value: "kitchen",
        label: "厨房",
        children: [
          { value: "pot", label: "锅具" },
          { value: "knife", label: "刀具" },
        ],
      },
    ],
  },
];

function labelOf(path: readonly string[]): string {
  let nodes: CatalogNode[] | undefined = catalog;
  let hit: CatalogNode | undefined;
  for (const segment of path) {
    hit = nodes?.find(node => node.value === segment);
    nodes = hit?.children;
  }
  return hit?.label ?? path[path.length - 1]!;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[][]>([["digital", "phone", "ios"]]);
  const text = value.map(labelOf).join("、");

  return (
    <>
      <XhCascaderRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        collection={catalog}
        multiple
        cascade
      >
        {({ levels, isIndeterminate }) => (
          <>
            <XhCascaderLabel>投放品类</XhCascaderLabel>
            <XhCascaderControl>
              <XhCascaderTrigger>
                <XhCascaderValueText>
                  {text || "请选择品类"}
                </XhCascaderValueText>
                <XhCascaderIndicator />
              </XhCascaderTrigger>
              <XhCascaderClearTrigger />
            </XhCascaderControl>
            <XhCascaderPositioner>
              <XhCascaderContent>
                {levels.map(lv => (
                  <XhCascaderColumn key={lv.level} level={lv.level}>
                    {lv.items.map(node => (
                      <XhCascaderItem key={node.value} value={node.value}>
                        <XhCascaderItemText>{node.label}</XhCascaderItemText>
                        {isIndeterminate(node.value) && (
                          <span
                            aria-hidden="true"
                            style={{ flex: "none", color: "var(--xh-fg-subtle)" }}
                          >
                            －
                          </span>
                        )}
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
      <p>{\`选中值（默认只收叶）：\${text || "（未选）"}\`}</p>
    </>
  );
}
`;export{e as default};
