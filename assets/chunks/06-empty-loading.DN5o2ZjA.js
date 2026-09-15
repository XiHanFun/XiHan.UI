const n=`// 空态与加载态 | 两个状态节点常挂着只靠 hidden 显隐：表体为空且在取数时露加载态，取数完了没有行才露空态
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableEmpty,
  XhTableHeader,
  XhTableLoading,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useMemo, useRef, useState } from "react";

interface Task {
  id: string;
  name: string;
  owner: string;
}

const columns = [
  { id: "name", label: "任务", width: "10rem" },
  { id: "owner", label: "负责人" },
];

const source: Task[] = [
  { id: "t1", name: "构建流水线", owner: "赵一" },
  { id: "t2", name: "组件回归", owner: "钱二" },
  { id: "t3", name: "文档校订", owner: "孙三" },
];

export default function Demo(): ReactNode {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(0);

  function load(): void {
    window.clearTimeout(timer.current);
    setTasks([]);
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setTasks(source);
      setLoading(false);
    }, 1200);
  }

  function reset(): void {
    window.clearTimeout(timer.current);
    setTasks([]);
    setLoading(false);
  }

  // 表体为空与否按 rows 推导，不必另写 empty
  const rows = useMemo(() => tasks.map(t => ({ id: t.id })), [tasks]);

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "grid", gap: "12px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={load}>取数</button>
        <button type="button" onClick={reset}>清空</button>
      </div>

      <XhTableRoot columns={columns} rows={rows} loading={loading}>
        <XhTableHeader>
          <XhTableRow>
            {columns.map(col => (
              <XhTableColumnHeader key={col.id} value={col.id}>
                {col.label}
              </XhTableColumnHeader>
            ))}
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {tasks.map(t => (
            <XhTableRow key={t.id} value={t.id}>
              <XhTableCell value="name">{t.name}</XhTableCell>
              <XhTableCell value="owner">{t.owner}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
        <XhTableLoading>正在取数…</XhTableLoading>
        <XhTableEmpty>还没有任务，点「取数」拉一份。</XhTableEmpty>
      </XhTableRoot>
    </div>
  );
}
`;export{n as default};
