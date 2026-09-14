// 树形表格 | rows 按契约就是一条已摊平的可见行序列：层级三件套逐行自报，缩进落在首格的内边距上
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ChevronRightIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

interface Node {
  id: string;
  label: string;
  owner: string;
  children?: Node[];
}

const columns = [
  { id: "name", label: "组织", width: "13rem" },
  { id: "owner", label: "负责人" },
];

const tree: Node[] = [
  {
    id: "rd",
    label: "研发中心",
    owner: "赵一",
    children: [
      {
        id: "rd-web",
        label: "前端组",
        owner: "钱二",
        children: [
          { id: "rd-web-1", label: "组件库", owner: "孙三" },
          { id: "rd-web-2", label: "控制台", owner: "李四" },
        ],
      },
      { id: "rd-api", label: "服务端组", owner: "周五" },
    ],
  },
  {
    id: "ops",
    label: "运维中心",
    owner: "吴六",
    children: [{ id: "ops-1", label: "值班平台", owner: "郑七" }],
  },
];

interface FlatRow {
  id: string;
  label: string;
  owner: string;
  level: number;
  pos: number;
  size: number;
  branch: boolean;
  open: boolean;
}

const twistyStyle: CSSProperties = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1rem",
  blockSize: "1rem",
  cursor: "pointer",
};

export default function Demo(): ReactNode {
  const [expanded, setExpanded] = useState<string[]>(["rd"]);

  // 收起分支的子树整段不出现在序列里，行号因此永远连续
  const flat = useMemo<FlatRow[]>(() => {
    const out: FlatRow[] = [];
    const walk = (nodes: Node[], level: number): void => {
      nodes.forEach((node, i) => {
        const branch = !!node.children?.length;
        const open = branch && expanded.includes(node.id);
        out.push({
          id: node.id,
          label: node.label,
          owner: node.owner,
          level,
          pos: i + 1,
          size: nodes.length,
          branch,
          open,
        });
        if (open)
          walk(node.children!, level + 1);
      });
    };
    walk(tree, 1);
    return out;
  }, [expanded]);

  const rows = useMemo(() => flat.map(row => ({ id: row.id })), [flat]);

  function toggle(id: string): void {
    setExpanded(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]));
  }

  // 焦点行是父级时左右方向键切换开合；连接层遇到不可展开的行原样放行这两个键
  function onBodyKeydown(event: KeyboardEvent<HTMLDivElement>, focused: string | null): void {
    if (focused == null)
      return;
    const row = flat.find(r => r.id === focused);
    if (!row?.branch)
      return;
    const wantOpen = event.key === "ArrowRight";
    const wantClose = event.key === "ArrowLeft";
    if ((wantOpen && !row.open) || (wantClose && row.open)) {
      event.preventDefault();
      toggle(focused);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: "520px", display: "grid", gap: "12px" }}>
      {/* 行有层级，root 报 treegrid */}
      <XhTableRoot columns={columns} rows={rows} role="treegrid">
        {({ focusedRow }) => (
          <>
            <XhTableHeader>
              <XhTableRow>
                {columns.map(col => (
                  <XhTableColumnHeader key={col.id} value={col.id}>
                    {col.label}
                  </XhTableColumnHeader>
                ))}
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody onKeyDown={event => onBodyKeydown(event, focusedRow)}>
              {flat.map(row => (
                <XhTableRow
                  key={row.id}
                  value={row.id}
                  aria-level={row.level}
                  aria-posinset={row.pos}
                  aria-setsize={row.size}
                  aria-expanded={row.branch ? row.open : undefined}
                >
                  {/* 缩进是首格的内边距，与层级号同源 */}
                  <XhTableCell
                    value="name"
                    style={{ paddingInlineStart: `${row.level * 16}px` }}
                  >
                    {/* 开合箭头只服务指针，键盘那一路走左右方向键，因此对读屏隐藏 */}
                    {row.branch
                      ? (
                          <span
                            aria-hidden="true"
                            style={twistyStyle}
                            onClick={() => toggle(row.id)}
                          >
                            <XhIcon
                              icon={ChevronRightIcon}
                              style={{ rotate: row.open ? "90deg" : "0deg" }}
                            />
                          </span>
                        )
                      : <span aria-hidden="true" style={twistyStyle} />}
                    {row.label}
                  </XhTableCell>
                  <XhTableCell value="owner">{row.owner}</XhTableCell>
                </XhTableRow>
              ))}
            </XhTableBody>
          </>
        )}
      </XhTableRoot>
      <span>{`展开：${expanded.length ? expanded.join("、") : "（无）"}`}</span>
    </div>
  );
}
