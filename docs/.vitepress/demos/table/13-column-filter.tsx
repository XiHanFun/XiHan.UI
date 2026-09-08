// 列过滤 | 过滤把手是列标题里的一段内容，过滤结果就是宿主算好后传进来的那份 rows；表头是表体的兄弟，把手上的按键不会被表体收走
import type { CSSProperties, ReactNode } from "react";
import { ChevronDownIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableEmpty,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

const columns = [
  { id: "name", label: "姓名", width: "7rem" },
  { id: "dept", label: "部门", width: "9rem" },
  { id: "city", label: "城市" },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
  { id: "u4", name: "李四", dept: "前端体验", city: "杭州" },
  { id: "u5", name: "周五", dept: "质量保障", city: "成都" },
  { id: "u6", name: "吴六", dept: "平台研发", city: "上海" },
];

const deptOptions = [...new Set(members.map(m => m.dept))];
const cityOptions = [...new Set(members.map(m => m.city))];

const menuStyle: CSSProperties = { display: "grid", gap: "6px", minInlineSize: "8rem" };
const optionStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "6px" };

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

export default function Demo(): ReactNode {
  // 过滤态由宿主持有，一个都没勾就是不过滤
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState<string[]>([]);

  const visible = useMemo(
    () =>
      members.filter(
        m =>
          (deptFilter.length === 0 || deptFilter.includes(m.dept))
          && (cityFilter.length === 0 || cityFilter.includes(m.city)),
      ),
    [deptFilter, cityFilter],
  );

  // 行序的事实源跟着过滤结果走
  const rows = useMemo(() => visible.map(m => ({ id: m.id })), [visible]);

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "12px" }}>
      <XhTableRoot columns={columns} rows={rows}>
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader value="name">姓名</XhTableColumnHeader>
            <XhTableColumnHeader value="dept">
              部门
              <XhPopoverRoot placement="bottom-start" size="sm">
                <XhPopoverTrigger aria-label="按部门过滤">
                  <XhIcon icon={ChevronDownIcon} />
                  {deptFilter.length ? "●" : ""}
                </XhPopoverTrigger>
                <XhPopoverPositioner>
                  <XhPopoverContent>
                    <XhPopoverTitle>按部门过滤</XhPopoverTitle>
                    <div style={menuStyle}>
                      {deptOptions.map(d => (
                        <label key={d} style={optionStyle}>
                          <input
                            type="checkbox"
                            value={d}
                            checked={deptFilter.includes(d)}
                            onChange={() => setDeptFilter(prev => toggle(prev, d))}
                          />
                          {d}
                        </label>
                      ))}
                      <button type="button" onClick={() => setDeptFilter([])}>不限</button>
                    </div>
                  </XhPopoverContent>
                </XhPopoverPositioner>
              </XhPopoverRoot>
            </XhTableColumnHeader>
            <XhTableColumnHeader value="city">
              城市
              <XhPopoverRoot placement="bottom-start" size="sm">
                <XhPopoverTrigger aria-label="按城市过滤">
                  <XhIcon icon={ChevronDownIcon} />
                  {cityFilter.length ? "●" : ""}
                </XhPopoverTrigger>
                <XhPopoverPositioner>
                  <XhPopoverContent>
                    <XhPopoverTitle>按城市过滤</XhPopoverTitle>
                    <div style={menuStyle}>
                      {cityOptions.map(c => (
                        <label key={c} style={optionStyle}>
                          <input
                            type="checkbox"
                            value={c}
                            checked={cityFilter.includes(c)}
                            onChange={() => setCityFilter(prev => toggle(prev, c))}
                          />
                          {c}
                        </label>
                      ))}
                      <button type="button" onClick={() => setCityFilter([])}>不限</button>
                    </div>
                  </XhPopoverContent>
                </XhPopoverPositioner>
              </XhPopoverRoot>
            </XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {visible.map(m => (
            <XhTableRow key={m.id} value={m.id}>
              <XhTableCell value="name">{m.name}</XhTableCell>
              <XhTableCell value="dept">{m.dept}</XhTableCell>
              <XhTableCell value="city">{m.city}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
        <XhTableEmpty>这组条件下没有人。</XhTableEmpty>
      </XhTableRoot>
      <span>
        {`命中 ${visible.length} / ${members.length} 人 · 部门：${deptFilter.length ? deptFilter.join("、") : "不限"} · 城市：${cityFilter.length ? cityFilter.join("、") : "不限"}`}
      </span>
    </div>
  );
}
