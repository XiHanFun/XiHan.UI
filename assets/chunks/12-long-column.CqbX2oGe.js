const n=`// 长列表只渲可视区 | 列自己就是滚动容器：按滚动位置切一段挂出来，其余交给撑高块，焦点那一条无论在不在窗口里都挂着
import type { CascaderColumn } from "@xihan-ui/headless";
import type { CSSProperties, KeyboardEvent, ReactNode, UIEvent } from "react";
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
import { useRef, useState } from "react";

// 行高与列高写死，窗口才算得出来
const ROW = 32;
const VIEW = 256;
const OVERSCAN = 6;

interface ColumnItem {
  value: string;
  label: string;
}

interface Row extends ColumnItem {
  index: number;
}

function shelves(prefix: string, name: string): ColumnItem[] {
  return Array.from({ length: 1000 }, (_, i) => ({
    value: \`\${prefix}-\${i + 1}\`,
    label: \`\${name}货位 \${String(i + 1).padStart(4, "0")}\`,
  }));
}

const warehouses = [
  { value: "east", label: "华东仓", children: shelves("east", "华东") },
  { value: "south", label: "华南仓", children: shelves("south", "华南") },
];

export default function Demo(): ReactNode {
  // 每一列自己的滚动位置：列号 → scrollTop
  const [scrolled, setScrolled] = useState<Record<number, number>>({});
  const shell = useRef<HTMLDivElement | null>(null);
  const [shelf, setShelf] = useState<string[][]>([]);

  function onScroll(level: number, event: UIEvent<HTMLDivElement>): void {
    const top = event.currentTarget.scrollTop;
    setScrolled(prev => ({ ...prev, [level]: top }));
  }

  // 展开那一刻以列真实的滚动位置为准，重算一遍窗口
  function onOpenChange(details: { open: boolean }): void {
    if (!details.open) {
      return;
    }
    requestAnimationFrame(() => {
      const next: Record<number, number> = {};
      shell.current
        ?.querySelectorAll<HTMLElement>("[data-part=\\"column\\"]")
        .forEach((el, level) => {
          next[level] = el.scrollTop;
        });
      setScrolled(next);
    });
  }

  // 方向键把焦点挪到了窗口外的一条：等它渲染出来再把浏览器焦点补上去，滚动随之跟到位
  function syncFocus(event: KeyboardEvent<HTMLDivElement>): void {
    const content = event.currentTarget;
    requestAnimationFrame(() => {
      const el = content.querySelector<HTMLElement>(
        "[data-part=\\"item\\"][data-highlighted]",
      );
      if (el && el !== document.activeElement) {
        el.focus();
      }
    });
  }

  // 该挂出来的那一段：可视区前后各多铺几条，再补上焦点所在的一条——
  // 它一旦离开 DOM，方向键就接不下去了
  function windowOf(column: CascaderColumn, focusedPath: string[] | null): Row[] {
    const max = Math.max(0, column.items.length * ROW - VIEW);
    const top = Math.min(scrolled[column.level] ?? 0, max);
    const start = Math.max(0, Math.floor(top / ROW) - OVERSCAN);
    const end = Math.min(
      column.items.length,
      Math.ceil((top + VIEW) / ROW) + OVERSCAN,
    );
    const rows: Row[] = column.items
      .slice(start, end)
      .map((item, i) => ({ value: item.value, label: item.label, index: start + i }));

    const anchor = focusedPath?.[column.level];
    const hit
      = anchor == null
        ? undefined
        : column.items.find(item => item.value === anchor);
    if (hit) {
      const at = column.items.indexOf(hit);
      if (at < start || at >= end) {
        rows.push({ value: hit.value, label: hit.label, index: at });
      }
    }
    return rows;
  }

  return (
    <div ref={shell}>
      <XhCascaderRoot
        value={shelf}
        onValueChange={details => setShelf(details.value)}
        collection={warehouses}
        placeholder="请选择货位"
        onOpenChange={onOpenChange}
      >
        {({ columns, focusedPath }) => (
          <>
            <XhCascaderLabel>货位（每仓 1000 条）</XhCascaderLabel>
            <XhCascaderControl>
              <XhCascaderTrigger>
                <XhCascaderValueText />
                <XhCascaderIndicator />
              </XhCascaderTrigger>
            </XhCascaderControl>
            <XhCascaderPositioner>
              <XhCascaderContent onKeyDown={syncFocus}>
                {columns.map(col => (
                  <XhCascaderColumn
                    key={col.level}
                    level={col.level}
                    style={{
                      "--xh-cascader-column-h": "256px",
                      "--xh-cascader-column-min-w": "11rem",
                      "position": "relative",
                      "paddingBlock": 0,
                    } as CSSProperties}
                    onScroll={event => onScroll(col.level, event)}
                  >
                    {/* 撑高块把滚动条撑到全长，条目按各自的索引落位 */}
                    <div
                      aria-hidden="true"
                      style={{ flex: "none", blockSize: \`\${col.items.length * ROW}px\` }}
                    />
                    {windowOf(col, focusedPath).map(row => (
                      <XhCascaderItem
                        key={row.value}
                        value={row.value}
                        style={{
                          position: "absolute",
                          insetInlineStart: "var(--xh-space-1)",
                          insetInlineEnd: "var(--xh-space-1)",
                          insetBlockStart: \`\${row.index * ROW}px\`,
                          blockSize: \`\${ROW}px\`,
                        }}
                      >
                        <XhCascaderItemText>{row.label}</XhCascaderItemText>
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
      <p>{\`当前货位：\${shelf[0]?.join(" / ") ?? "（未选）"}\`}</p>
    </div>
  );
}
`;export{n as default};
