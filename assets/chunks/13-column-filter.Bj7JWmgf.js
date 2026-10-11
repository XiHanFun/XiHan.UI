var e=`// 列过滤 | 过滤按钮是列标题中的一段内容，过滤结果就是宿主计算后传入的 rows；表头是表体的兄弟，按钮上的按键不会被表体接管
import type { CSSProperties, ReactNode } from "react";
import { FilterIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhCheckboxGroupRoot,
  XhIcon,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
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

const deptOptions = [...new Set(members.map(m => m.dept))].map(d => ({ value: d, label: d }));
const cityOptions = [...new Set(members.map(m => m.city))].map(c => ({ value: c, label: c }));

const menuStyle: CSSProperties = { display: "grid", gap: "6px", minInlineSize: "8rem" };

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
            <XhTableColumnHeader value="name"><XhTableColumnLabel>姓名</XhTableColumnLabel></XhTableColumnHeader>
            <XhTableColumnHeader value="dept">
              <XhTableColumnLabel>部门</XhTableColumnLabel>
              <XhPopoverRoot placement="bottom-start" size="sm">
                <XhPopoverTrigger
                  aria-label="按部门过滤"
                  style={deptFilter.length ? { color: "var(--xh-fg-brand)" } : undefined}
                >
                  <XhIcon icon={FilterIcon} />
                </XhPopoverTrigger>
                <XhPopoverPositioner>
                  <XhPopoverContent>
                    <XhPopoverTitle>按部门过滤</XhPopoverTitle>
                    <div style={menuStyle}>
                      <XhCheckboxGroupRoot
                        value={deptFilter}
                        onValueChange={details => setDeptFilter(details.value)}
                        collection={deptOptions}
                        aria-label="部门"
                        size="sm"
                      />
                      <XhButton size="sm" variant="outline" onClick={() => setDeptFilter([])}>不限</XhButton>
                    </div>
                  </XhPopoverContent>
                </XhPopoverPositioner>
              </XhPopoverRoot>
            </XhTableColumnHeader>
            <XhTableColumnHeader value="city">
              <XhTableColumnLabel>城市</XhTableColumnLabel>
              <XhPopoverRoot placement="bottom-start" size="sm">
                <XhPopoverTrigger
                  aria-label="按城市过滤"
                  style={cityFilter.length ? { color: "var(--xh-fg-brand)" } : undefined}
                >
                  <XhIcon icon={FilterIcon} />
                </XhPopoverTrigger>
                <XhPopoverPositioner>
                  <XhPopoverContent>
                    <XhPopoverTitle>按城市过滤</XhPopoverTitle>
                    <div style={menuStyle}>
                      <XhCheckboxGroupRoot
                        value={cityFilter}
                        onValueChange={details => setCityFilter(details.value)}
                        collection={cityOptions}
                        aria-label="城市"
                        size="sm"
                      />
                      <XhButton size="sm" variant="outline" onClick={() => setCityFilter([])}>不限</XhButton>
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
      <span data-demo-output>
        {\`命中 \${visible.length} / \${members.length} 人 · 部门：\${deptFilter.length ? deptFilter.join("、") : "不限"} · 城市：\${cityFilter.length ? cityFilter.join("、") : "不限"}\`}
      </span>
    </div>
  );
}
`;export{e as default};