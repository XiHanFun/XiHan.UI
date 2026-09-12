const n=`// 表格里的单元格 | 一格一个就地编辑：点开就是输入框，收尾即写回行数据；autoResize 让输入框按内容宽窄走，不把列撑变形
import type { CSSProperties, ReactNode } from "react";
import {
  XhEditableControl,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/react";
import { useState } from "react";

interface Row {
  id: string;
  name: string;
  dept: string;
  phone: string;
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
    { id: "u1", name: "赵一", dept: "平台研发", phone: "13800000001" },
    { id: "u2", name: "钱二", dept: "前端体验", phone: "13800000002" },
    { id: "u3", name: "孙三", dept: "基础架构", phone: "13800000003" },
  ]);

  function patch(id: string, key: "name" | "dept" | "phone", value: string): void {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, [key]: value } : row)));
  }

  return (
    <div style={{ width: "100%", maxWidth: "520px", display: "grid", gap: "12px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={head}>姓名</th>
            <th style={head}>部门</th>
            <th style={head}>手机号</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td style={cell}>
                <XhEditableRoot
                  value={row.name}
                  onValueChange={details => patch(row.id, "name", details.value)}
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
                  value={row.dept}
                  onValueChange={details => patch(row.id, "dept", details.value)}
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
                  value={row.phone}
                  onValueChange={details => patch(row.id, "phone", details.value)}
                  placeholder="未填写"
                  maxLength={11}
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

      <span>
        数据源：
        {rows.map(row => \`\${row.name}/\${row.dept}\`).join("，")}
      </span>
    </div>
  );
}
`;export{n as default};
