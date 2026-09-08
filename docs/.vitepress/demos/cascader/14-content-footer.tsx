// 浮层底栏 | footer 写在 content 里、与列并列，横跨全部列；它不进任何一列的拥有关系，方向键也走不到
import type { ReactNode } from "react";
import {
  XhButton,
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderFooter,
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

const catalog = [
  {
    value: "fruit",
    label: "水果",
    children: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "grape", label: "葡萄" },
    ],
  },
  {
    value: "vegetable",
    label: "蔬菜",
    children: [
      { value: "tomato", label: "番茄" },
      { value: "potato", label: "土豆" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[][]>([["fruit", "apple"]]);

  return (
    <>
      <XhCascaderRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={catalog}
        multiple
        placeholder="可以多挑几条"
      >
        {({ levels, value, clear, setOpen }) => (
          <>
            <XhCascaderLabel>采购清单</XhCascaderLabel>
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
                <XhCascaderFooter style={{ justifyContent: "space-between" }}>
                  <span>{`已选 ${value.length} 条`}</span>
                  <span style={{ display: "flex", gap: "8px" }}>
                    <XhButton size="sm" variant="ghost" onClick={() => clear()}>清空</XhButton>
                    <XhButton size="sm" onClick={() => setOpen(false)}>完成</XhButton>
                  </span>
                </XhCascaderFooter>
              </XhCascaderContent>
            </XhCascaderPositioner>
          </>
        )}
      </XhCascaderRoot>
      <p>{`已选：${picked.map(p => p.join("/")).join("、") || "（无）"}`}</p>
    </>
  );
}
