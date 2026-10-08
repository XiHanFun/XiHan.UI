var e=`// 大树虚拟化 | 完整树数据负责层级、选中与键盘语义，窗口只挂载可见行；Virtualizer 的 count 取展开后的可见行数，窗口里的行平铺渲染，缩进按层级由作者给
import type { CSSProperties, ReactNode } from "react";
import { flattenTree } from "@xihan-ui/headless";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

// 二十个部门，每个部门五十位成员
const departments = Array.from({ length: 20 }, (_, d) => ({
  value: \`dept-\${d + 1}\`,
  label: \`部门 \${d + 1}\`,
  children: Array.from({ length: 50 }, (_, m) => ({
    value: \`dept-\${d + 1}-\${m + 1}\`,
    label: \`成员 \${d + 1}-\${m + 1}\`,
  })),
}));

// 平铺的行没有子层容器顶出缩进，按层级补上
function indent(level: number): CSSProperties {
  return { marginInlineStart: \`calc(var(--xh-tree-select-indent, var(--xh-space-4)) * \${level - 1})\` };
}

export default function Demo(): ReactNode {
  const [expanded, setExpanded] = useState<string[]>(["dept-1"]);
  // 可见行随展开集合现算：count 与窗口里渲染哪一行都按它
  const rows = useMemo(() => flattenTree(departments, expanded), [expanded]);

  return (
    <XhVirtualizerRoot count={rows.length} estimateSize={36} viewportTabIndex={-1}>
      {({ virtualItems, collectionVirtualizer }) => (
        <XhTreeSelectRoot
          expandedValue={expanded}
          onExpandedValueChange={details => setExpanded(details.value)}
          collection={departments}
          virtualizer={collectionVirtualizer}
          placeholder="选一位成员"
        >
          <XhTreeSelectLabel>负责人</XhTreeSelectLabel>
          <XhTreeSelectControl>
            <XhTreeSelectTrigger>
              <XhTreeSelectValueText />
              <XhTreeSelectIndicator />
            </XhTreeSelectTrigger>
          </XhTreeSelectControl>
          <XhTreeSelectPositioner>
            <XhTreeSelectContent>
              <XhTreeSelectTree style={{ overflow: "visible" }}>
                <XhVirtualizerViewport style={{ blockSize: 240 }}>
                  <XhVirtualizerContent>
                    {virtualItems.map((virtualItem) => {
                      const row = rows[virtualItem.index]!;
                      return (
                        <XhVirtualizerItem key={virtualItem.key} value={virtualItem.index} style={{ blockSize: 36 }}>
                          {row.branch
                            ? (
                                <XhTreeSelectBranch value={row.value} style={indent(row.level)}>
                                  <XhTreeSelectBranchControl>
                                    <XhTreeSelectBranchTrigger />
                                    <XhTreeSelectBranchText>{row.label}</XhTreeSelectBranchText>
                                    <XhTreeSelectItemIndicator />
                                  </XhTreeSelectBranchControl>
                                </XhTreeSelectBranch>
                              )
                            : (
                                <XhTreeSelectItem value={row.value} style={indent(row.level)}>
                                  <XhTreeSelectItemIndicator />
                                  <XhTreeSelectItemText>{row.label}</XhTreeSelectItemText>
                                </XhTreeSelectItem>
                              )}
                        </XhVirtualizerItem>
                      );
                    })}
                  </XhVirtualizerContent>
                </XhVirtualizerViewport>
              </XhTreeSelectTree>
            </XhTreeSelectContent>
          </XhTreeSelectPositioner>
        </XhTreeSelectRoot>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};