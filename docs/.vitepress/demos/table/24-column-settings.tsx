// 列设置与工具条 | 工具条渲成表的兄弟排在表前（root 是 grid，工具条进不去它里面）；列设置区照 columnSettings 渲，藏起来的列也在其中，只剩最后一列显示着时那颗把手转禁用
import type { CSSProperties, ReactNode } from "react";
import {
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnList,
  XhTableColumnVisibilityTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableToolbar,
} from "@xihan-ui/react";
import { useState } from "react";

interface Member {
  id: string;
  name: string;
  dept: string;
  city: string;
  level: string;
}

const columns = [
  { id: "name", label: "姓名", width: "7rem" },
  { id: "dept", label: "部门", width: "9rem" },
  { id: "city", label: "城市", width: "7rem" },
  { id: "level", label: "职级" },
];

const members: Member[] = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京", level: "P6" },
  { id: "u4", name: "李四", dept: "前端体验", city: "杭州", level: "P5" },
];

const rows = members.map(m => ({ id: m.id }));

const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "8px" };
const nameStyle: CSSProperties = { cursor: "pointer" };
const cell = (m: Member, id: string): string => m[id as keyof Member];
const toolbarTitle = `成员 ${members.length} 人`;

export default function Demo(): ReactNode {
  // 偏好存哪儿归使用者：这里只把它显示出来，存 localStorage 还是存后端都是应用的事
  const [saved, setSaved] = useState<string>("尚未改过");

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        columns={columns}
        rows={rows}
        onColumnPreferenceChange={details => setSaved(JSON.stringify(details.value))}
        toolbar={({ columnSettings, setColumnHidden }) => (
          <XhTableToolbar>
            <span>{toolbarTitle}</span>
            <XhPopoverRoot placement="bottom-end" size="sm">
              <XhPopoverTrigger aria-label="列设置">列设置</XhPopoverTrigger>
              <XhPopoverPositioner>
                <XhPopoverContent>
                  <XhPopoverTitle>列设置</XhPopoverTitle>
                  <XhTableColumnList>
                    {columnSettings.map(col => (
                      <div key={col.id} style={rowStyle}>
                        <XhTableColumnVisibilityTrigger value={col.id} />
                        <span
                          style={nameStyle}
                          onClick={() => col.toggleable && setColumnHidden(col.id, !col.hidden)}
                        >
                          {col.label}
                        </span>
                      </div>
                    ))}
                  </XhTableColumnList>
                </XhPopoverContent>
              </XhPopoverPositioner>
            </XhPopoverRoot>
          </XhTableToolbar>
        )}
      >
        {({ columns: shown }) => (
          <>
            <XhTableHeader>
              <XhTableRow>
                {shown.map(col => (
                  <XhTableColumnHeader key={col.id} value={col.id}>
                    {col.label}
                  </XhTableColumnHeader>
                ))}
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              {members.map(m => (
                <XhTableRow key={m.id} value={m.id}>
                  {shown.map(col => (
                    <XhTableCell key={col.id} value={col.id}>
                      {cell(m, col.id)}
                    </XhTableCell>
                  ))}
                </XhTableRow>
              ))}
            </XhTableBody>
          </>
        )}
      </XhTableRoot>
      <span>{`存下来的列偏好：${saved}`}</span>
    </div>
  );
}
