// 悬停展开 | expand-trigger 改成 hover 后，指针划过分支即开子列，只挪展开路径不抢焦点；键盘仍走右方向键
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
import { useState } from "react";

const menu = [
  {
    value: "frontend",
    label: "前端",
    children: [
      { value: "vue", label: "Vue" },
      { value: "wc", label: "Web Components" },
    ],
  },
  {
    value: "backend",
    label: "后端",
    children: [
      { value: "dotnet", label: ".NET" },
      { value: "node", label: "Node.js" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[][]>([]);

  return (
    <>
      <XhCascaderRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={menu}
        expandTrigger="hover"
        placeholder="划过即展开"
      >
        {({ levels }) => (
          <>
            <XhCascaderLabel>方向</XhCascaderLabel>
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
      <p>{`当前路径：${picked[0]?.join(" / ") ?? "（未选）"}`}</p>
    </>
  );
}
