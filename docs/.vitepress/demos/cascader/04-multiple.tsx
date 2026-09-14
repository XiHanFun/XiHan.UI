// 多选 | 选择多个分类路径
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

const catalog = [
  {
    value: "fruit",
    label: "水果",
    children: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
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
    <XhCascaderRoot
      value={picked}
      onValueChange={details => setPicked(details.value)}
      collection={catalog}
      multiple
      placeholder="可以多挑几条"
    >
      {({ levels }) => (
        <>
          <XhCascaderLabel>采购清单</XhCascaderLabel>
          <XhCascaderControl>
            <XhCascaderTrigger>
              <XhCascaderValueText />
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
  );
}
