// 中间层可选 | change-on-select 让分支自己也能落值；选中分支后浮层不收起，还能接着往下挑
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
    value: "docs",
    label: "文档",
    children: [
      { value: "guide", label: "指南" },
      { value: "api", label: "接口" },
    ],
  },
  {
    value: "design",
    label: "设计",
    children: [
      { value: "token", label: "设计令牌" },
      { value: "icon", label: "图标" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [path, setPath] = useState<string[][]>([]);

  return (
    <>
      <XhCascaderRoot
        value={path}
        onValueChange={details => setPath(details.value)}
        collection={catalog}
        changeOnSelect
        separator=" › "
        placeholder="选一个栏目"
      >
        {({ levels }) => (
          <>
            <XhCascaderLabel>栏目</XhCascaderLabel>
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
      <p>{`当前路径：${path[0]?.join(" › ") ?? "（未选）"}`}</p>
    </>
  );
}
