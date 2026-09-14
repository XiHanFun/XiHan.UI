// 树形表拖拽 | 行声明了 parentId 就是树：拖到一行中段是放进这一行（换个父），拖到上下两端仍是插在它前后；键盘走 Alt + 上下键同层挪、Alt + 左右键改缩进。库报的是「搬到哪个父下面的第几位」外加重排好的整份行序，写回归宿主——按 ids 重排、再把那一行的 parentId 设成 parent，两件都做才对得上。许不许搬那一句归 allowRowDrop
import type { TableRowMoveDetails } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

interface Task {
  id: string;
  label: string;
  owner: string;
  /** 父行 id，根层为 null。 */
  parentId: string | null;
  /** 分组行：收得下子行，被搬空了也还收得下。 */
  group?: boolean;
}

const columns = [
  { id: "name", label: "任务", width: "14rem" },
  { id: "owner", label: "负责人" },
];

// 表格的树是一份带 parentId 的扁平数组：父子归属由 parentId 定，同层次序由数组里的先后定
const initial: Task[] = [
  { id: "client", label: "客户端", owner: "赵一", parentId: null, group: true },
  { id: "t1", label: "登录页改版", owner: "钱二", parentId: "client" },
  { id: "t2", label: "离线缓存", owner: "孙三", parentId: "client" },
  { id: "server", label: "服务端", owner: "李四", parentId: null, group: true },
  { id: "t3", label: "限流中间件", owner: "周五", parentId: "server" },
  { id: "archive", label: "已归档", owner: "吴六", parentId: null, group: true },
  { id: "t4", label: "旧版导出", owner: "郑七", parentId: "archive" },
];

// 这一次搬家许不许。库自己兜住「落在自己身上 / 落进自己的后代 / 算下来还是原位」，
// 「落进普通数据行」也早被挡掉——只有可展开或已经有子行的行才给中段那一档。
// 剩下的是这份数据的规矩：已归档那一组只出不进
const allowRowDrop = (move: TableRowMoveDetails): boolean => move.parent !== "archive";

// 叶子行没有开合把手，补一块同宽的空位，两种行的文字才起在同一处
const twistySpacer: CSSProperties = {
  display: "inline-flex",
  flex: "none",
  inlineSize: "var(--xh-table-trigger-size, var(--xh-control-indicator-size))",
};

export default function Demo(): ReactNode {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [expanded, setExpanded] = useState<string[]>(["client", "server", "archive"]);
  const [log, setLog] = useState("按住任意一行拖走，或 Tab 进表体按 Alt + 方向键搬");

  const byId = useMemo(() => new Map(tasks.map(task => [task.id, task])), [tasks]);

  // 行序与父子归属的事实源就是这份数组。分组行标上 expandable：
  // 有子行的行本来就展得开，标了它的分组被搬空之后也仍收得下东西
  const rows = useMemo(
    () =>
      tasks.map(task => ({
        id: task.id,
        parentId: task.parentId ?? undefined,
        expandable: task.group,
      })),
    [tasks],
  );

  // 写回是两件事：按 ids 重排，再把搬走那一行的 parentId 换成 parent。
  // 只重排它会留在原来的父下面，只换父则同层次序对不上，缺一件都是错的
  function onRowMove(move: TableRowMoveDetails): void {
    const known = byId;
    setTasks(move.ids.flatMap((id) => {
      const task = known.get(id);
      if (!task)
        return [];
      return [id === move.id ? { ...task, parentId: move.parent } : task];
    }));
    const where = move.parent == null ? "根层" : (known.get(move.parent)?.label ?? move.parent);
    setLog(`${known.get(move.id)?.label ?? move.id} 搬到了${where}第 ${move.index + 1} 位`);
  }

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        expandedValue={expanded}
        columns={columns}
        rows={rows}
        allowRowDrop={allowRowDrop}
        rowReorderable
        onExpandedValueChange={details => setExpanded(details.value)}
        onRowMove={onRowMove}
      >
        {({ visibleRows }) => (
          <>
            <XhTableCaption>
              拖到一行中段是放进这一行，拖到上下两端是插在它前后；也可以 Tab
              进表体，用「Alt + 上下键」同层挪、「Alt + 左右键」改缩进。已归档那一组只出不进
            </XhTableCaption>
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
              {/* 收起的分组连着它的子行整段不出现；摊平、层级号与 aria 三件套都归库，这里只管渲 */}
              {visibleRows.filter(item => item.kind === "data").map(row => (
                <XhTableRow key={row.id} value={row.id}>
                  {/* 缩进是首格的内边距，与库报的层级号同源 */}
                  <XhTableCell value="name" style={{ paddingInlineStart: `${row.level * 16}px` }}>
                    {/* 把手只服务指针，键盘那一路走裸左右方向键，因此它对读屏隐藏也不占 Tab 位 */}
                    {row.expandable
                      ? <XhTableExpandTrigger />
                      : <span aria-hidden="true" style={twistySpacer} />}
                    {byId.get(row.id)?.label}
                  </XhTableCell>
                  <XhTableCell value="owner">{byId.get(row.id)?.owner}</XhTableCell>
                </XhTableRow>
              ))}
            </XhTableBody>
          </>
        )}
      </XhTableRoot>
      <span>{log}</span>
    </div>
  );
}
