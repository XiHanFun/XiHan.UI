const a=`// 多选 | multiple 下已选路径在触发器里排成标签，文字是整条路径；超出 maxTagCount（默认 3）的折进 +N，触发器里的标签只作展示
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
  XhCascaderOverflowTag,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTag,
  XhCascaderTagList,
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
  const [picked, setPicked] = useState<string[][]>([["fruit", "apple"], ["vegetable", "tomato"]]);

  return (
    <XhCascaderRoot
      value={picked}
      onValueChange={details => setPicked(details.value)}
      collection={catalog}
      multiple
      placeholder="可以多挑几条"
    >
      {({ levels, tags }) => (
        <>
          <XhCascaderLabel>采购清单</XhCascaderLabel>
          <XhCascaderControl>
            <XhCascaderTrigger>
              <XhCascaderValueText />
              {/* 标签行：有选中时露面、占位文字让位；标签身份写路径的比较键 */}
              <XhCascaderTagList>
                {tags.map(tag => (
                  <XhCascaderTag key={tag.key} value={tag.key}>{tag.label}</XhCascaderTag>
                ))}
                <XhCascaderOverflowTag />
              </XhCascaderTagList>
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
`;export{a as default};
