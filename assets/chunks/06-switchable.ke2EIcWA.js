const n=`// 整表进出编辑态 | edit 受控就由宿主统一调度：一个开关把整张表切进编辑，放弃时宿主拿自己留的底稿还原
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhEditableControl,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Row {
  id: string;
  name: string;
  quota: string;
}

const cell: CSSProperties = {
  padding: "6px 10px",
  borderBlockEnd: "1px solid var(--xh-border-subtle)",
};

const head: CSSProperties = {
  ...cell,
  textAlign: "start",
  fontWeight: 500,
  color: "var(--xh-fg-muted)",
};

export default function Demo(): ReactNode {
  const [rows, setRows] = useState<Row[]>([
    { id: "a", name: "北区", quota: "1200" },
    { id: "b", name: "南区", quota: "980" },
    { id: "c", name: "东区", quota: "1450" },
  ]);

  const [editing, setEditing] = useState(false);
  const backup = useRef<Row[]>([]);

  function start(): void {
    backup.current = rows.map(row => ({ ...row }));
    setEditing(true);
  }

  function save(): void {
    setEditing(false);
  }

  function discard(): void {
    setRows(backup.current.map(row => ({ ...row })));
    setEditing(false);
  }

  function patch(id: string, key: "name" | "quota", value: string): void {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, [key]: value } : row)));
  }

  return (
    <div style={{ width: "100%", maxWidth: "460px", display: "grid", gap: "12px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {editing
          ? (
              <>
                <XhButton size="sm" onClick={save}>完成</XhButton>
                <XhButton size="sm" onClick={discard}>放弃</XhButton>
              </>
            )
          : <XhButton size="sm" onClick={start}>编辑整表</XhButton>}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={head}>区域</th>
            <th style={head}>配额</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td style={cell}>
                <XhEditableRoot
                  value={row.name}
                  onValueChange={details => patch(row.id, "name", details.value)}
                  edit={editing}
                  placeholder="未填写"
                  autoResize
                >
                  <XhEditableControl>
                    <XhEditablePreview />
                    <XhEditableInput />
                  </XhEditableControl>
                </XhEditableRoot>
              </td>
              <td style={cell}>
                <XhEditableRoot
                  value={row.quota}
                  onValueChange={details => patch(row.id, "quota", details.value)}
                  edit={editing}
                  placeholder="未填写"
                  autoResize
                >
                  <XhEditableControl>
                    <XhEditablePreview />
                    <XhEditableInput />
                  </XhEditableControl>
                </XhEditableRoot>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;export{n as default};
