// 分组 | 条目分段展示：group 是 role=group 的段落壳，group-label 是它的可及名字；条目照旧归到同一份集合，方向键与连打检索跨段贯通
import type { ReactNode } from "react";
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectGroup,
  XhSelectGroupLabel,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const groups = [
  {
    id: "fruit",
    label: "水果",
    items: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
    ],
  },
  {
    id: "vegetable",
    label: "蔬菜",
    items: [
      { value: "carrot", label: "胡萝卜" },
      { value: "celery", label: "芹菜" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        placeholder="请选择"
      >
        <XhSelectLabel>食材</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {/* 段标题不带条目标记，导航与检索都跳过它 */}
              {groups.map(g => (
                <XhSelectGroup key={g.id} value={g.id}>
                  <XhSelectGroupLabel>{g.label}</XhSelectGroupLabel>
                  {g.items.map(o => (
                    <XhSelectItem key={o.value} value={o.value}>
                      <XhSelectItemText>{o.label}</XhSelectItemText>
                      <XhSelectItemIndicator />
                    </XhSelectItem>
                  ))}
                </XhSelectGroup>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      <p>
        当前值：
        {picked[0] ?? "（未选）"}
      </p>
    </>
  );
}
