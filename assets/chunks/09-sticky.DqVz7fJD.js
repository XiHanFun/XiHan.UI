var e=`// 分组标题 | stickyIndices 登记标题的下标：滚过它之后它钉在起点，下一组的标题滚上来时接替
import type { CSSProperties, ReactNode } from "react";
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const groups = ["A", "B", "C", "D", "E", "F"];
const rows = groups.flatMap(letter => [
  { header: true, text: letter },
  ...Array.from({ length: 12 }, (_, i) => ({ header: false, text: \`\${letter}\${i + 1} 联系人\` })),
]);
const stickyIndices = rows.flatMap((row, index) => (row.header ? [index] : []));

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "36px",
  paddingInline: "12px",
  borderBlockEnd: "1px solid var(--xh-border-subtle)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "36px",
  paddingInline: "12px",
  fontWeight: 600,
  color: "var(--xh-fg-muted)",
};

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot
      count={rows.length}
      estimateSize={36}
      stickyIndices={stickyIndices}
      style={{ blockSize: "260px", inlineSize: "100%", maxInlineSize: "420px" }}
    >
      {({ virtualItems }) => (
        <XhVirtualizerViewport>
          <XhVirtualizerContent>
            {/* 钉住的条目自带实底（--xh-virtualizer-sticky-bg），滚过去的条目从它下面穿过 */}
            {virtualItems.map(item => (
              <XhVirtualizerItem
                key={item.key}
                value={item.index}
                style={rows[item.index]!.header ? headerStyle : rowStyle}
              >
                {rows[item.index]!.text}
              </XhVirtualizerItem>
            ))}
          </XhVirtualizerContent>
        </XhVirtualizerViewport>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};