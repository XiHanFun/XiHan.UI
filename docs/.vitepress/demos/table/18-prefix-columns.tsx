// 前缀列与分页序号 | prefix-columns 让库把序号/多选列插在最前面并占住列号；序号是分页全局序号，翻到第二页不会又从 1 开始
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/react";
import { Fragment, useState } from "react";

const columns = [
  { id: "name", label: "名称" },
  { id: "owner", label: "负责人" },
  { id: "status", label: "状态" },
];

const all = Array.from({ length: 43 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `资源 ${i + 1}`,
  owner: ["曦寒", "碧落", "葳蕤"][i % 3],
  status: i % 4 === 0 ? "停用" : "启用",
}));

const pageSize = 10;

export default function Demo(): ReactNode {
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<string[]>([]);

  // 切片归调用方（或分页组件的 api.slice）：表格只拿 page/pageSize 算序号
  const pageRows = all.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhTableRoot
        selection={selection}
        columns={columns}
        rows={pageRows.map(r => ({ id: r.id }))}
        prefixColumns={["index", "select"]}
        page={page}
        pageSize={pageSize}
        selectionMode="multiple"
        striped
        onSelectionChange={details => setSelection(Array.isArray(details.value) ? details.value : [])}
      >
        {({ columns: cols, rowNumber }) => (
          <>
            <XhTableHeader>
              <XhTableRow value="__head__">
                {cols.map(c => (
                  <XhTableColumnHeader key={c.id} value={c.id}>
                    {c.kind === "select"
                      ? <XhTableSelectAllTrigger />
                      : c.kind === "index" ? "#" : c.label}
                  </XhTableColumnHeader>
                ))}
              </XhTableRow>
            </XhTableHeader>

            <XhTableBody>
              {pageRows.map(row => (
                <XhTableRow key={row.id} value={row.id}>
                  {cols.map(c => (
                    <XhTableCell key={c.id} value={c.id}>
                      {c.kind === "select"
                        ? <XhTableRowSelectTrigger />
                        : c.kind === "index"
                          ? rowNumber(row.id)
                          : (row as Record<string, string>)[c.id]}
                    </XhTableCell>
                  ))}
                </XhTableRow>
              ))}
            </XhTableBody>
          </>
        )}
      </XhTableRoot>

      <XhPaginationRoot
        page={page}
        count={all.length}
        pageSize={pageSize}
        style={{ display: "flex", gap: "4px" }}
        onPageChange={details => setPage(details.page)}
      >
        {({ pages }) => (
          <>
            <XhPaginationPrevTrigger />
            {pages.map((p, i) => (
              <Fragment key={`${p}-${i}`}>
                {p === "ellipsis"
                  ? <XhPaginationEllipsisTrigger />
                  : <XhPaginationItem value={p}>{p}</XhPaginationItem>}
              </Fragment>
            ))}
            <XhPaginationNextTrigger />
          </>
        )}
      </XhPaginationRoot>

      <span style={{ fontSize: "13px" }}>{`已选 ${selection.length} 项 · 序号跨页连续`}</span>
    </div>
  );
}
