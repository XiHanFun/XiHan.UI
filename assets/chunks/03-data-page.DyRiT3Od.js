const e=`// 数据页 | 搜索、筛选、分段、表格、状态标签、分页与空态同框：一份数据经四道筛选后落进表体，筛没了就换空态
import type { SelectNode, TableSelection, TableSortDescriptor } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhEmptyStateDescription,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhPageHeaderDescription,
  XhPageHeaderExtra,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPaginationSummary,
  XhSegmentedRoot,
  XhSelectRoot,
  XhSeparator,
  XhSpinner,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableEmpty,
  XhTableHeader,
  XhTableLoading,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
  XhTableSortTrigger,
  XhTagLabel,
  XhTagRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

interface Order {
  id: string;
  no: string;
  customer: string;
  amount: number;
  status: "paid" | "shipping" | "refund";
  days: number;
}

const statusMeta = {
  paid: { label: "已付款", tone: "success" as const },
  shipping: { label: "配送中", tone: "info" as const },
  refund: { label: "退款中", tone: "warning" as const },
};

const columns = [
  { id: "select", width: "3rem" },
  { id: "no", label: "单号", width: "10rem", sortable: true },
  { id: "customer", label: "客户" },
  { id: "amount", label: "金额", width: "7rem", sortable: true },
  { id: "status", label: "状态", width: "6rem" },
];

const source: Order[] = [
  { id: "o1", no: "SO-2041", customer: "远岫科技", amount: 1280, status: "paid", days: 1 },
  { id: "o2", no: "SO-2042", customer: "青川物流", amount: 640, status: "shipping", days: 2 },
  { id: "o3", no: "SO-2043", customer: "海塘制造", amount: 3990, status: "refund", days: 5 },
  { id: "o4", no: "SO-2044", customer: "远岫科技", amount: 210, status: "paid", days: 9 },
  { id: "o5", no: "SO-2045", customer: "临江商贸", amount: 1750, status: "shipping", days: 12 },
  { id: "o6", no: "SO-2046", customer: "海塘制造", amount: 880, status: "paid", days: 20 },
];

const statuses: SelectNode[] = [
  { value: "all", label: "全部状态" },
  { value: "paid", label: "已付款" },
  { value: "shipping", label: "配送中" },
  { value: "refund", label: "退款中" },
];

const ranges = [
  { value: "7", label: "近 7 天" },
  { value: "14", label: "近 14 天" },
  { value: "30", label: "近 30 天" },
];

const pageSize = 4;

const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--xh-space-4)",
  inlineSize: "100%",
};

// 各控件自带标题，按底边对齐，输入区才在一条线上
const filtersStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "end",
  gap: "var(--xh-space-3)",
};

const searchStyle: CSSProperties = { inlineSize: "200px" };

// 竖线要有确定高度才画得出来，取控件行高那一档
const dividerStyle: CSSProperties = { blockSize: "var(--xh-control-h-md)" };

const loadingStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--xh-space-2)",
};

const pagerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "var(--xh-space-2)",
};

export default function Demo(): ReactNode {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>(["all"]);
  const [range, setRange] = useState<string | null>("30");
  const [sort, setSort] = useState<TableSortDescriptor[]>([]);
  const [selection, setSelection] = useState<TableSelection>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 四道筛选依次收窄：时间粒度、状态、关键词，最后按排序链排一遍
  const filtered = useMemo(() => {
    const days = Number(range);
    const wanted = status[0] ?? "all";
    const text = keyword.trim();
    const rows = source.filter(
      order =>
        order.days <= days
        && (wanted === "all" || order.status === wanted)
        && (text === "" || order.no.includes(text) || order.customer.includes(text)),
    );
    if (sort.length === 0)
      return rows;
    return [...rows].sort((a, b) => {
      for (const rule of sort) {
        const diff = rule.id === "amount"
          ? a.amount - b.amount
          : a.no.localeCompare(b.no, "zh");
        if (diff !== 0)
          return rule.direction === "asc" ? diff : -diff;
      }
      return 0;
    });
  }, [keyword, status, range, sort]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  );

  const rows = useMemo(() => paged.map(order => ({ id: order.id })), [paged]);

  // 筛选条件一动就退回第一页，否则会停在一页不存在的页码上
  useEffect(() => {
    setPage(1);
  }, [keyword, status, range]);

  function resetFilters(): void {
    setKeyword("");
    setStatus(["all"]);
    setRange("30");
    setSort([]);
    setSelection([]);
  }

  // 取数用定时器代替真实请求，露一下加载态
  const timer = useRef(0);
  function refresh(): void {
    window.clearTimeout(timer.current);
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
    }, 900);
  }

  return (
    <div style={pageStyle}>
      <XhPageHeaderRoot>
        <XhPageHeaderTitle>订单列表</XhPageHeaderTitle>
        <XhPageHeaderDescription>
          {\`共 \${source.length} 条，筛选后 \${filtered.length} 条\`}
        </XhPageHeaderDescription>
        <XhPageHeaderExtra>
          <XhButton variant="ghost" size="sm" onClick={refresh}>刷新</XhButton>
          <XhButton variant="solid" size="sm">导出</XhButton>
        </XhPageHeaderExtra>
      </XhPageHeaderRoot>

      <div style={filtersStyle}>
        <XhTextFieldRoot
          value={keyword}
          placeholder="搜单号或客户"
          onValueChange={details => setKeyword(details.value)}
        >
          <XhTextFieldLabel>关键词</XhTextFieldLabel>
          <XhTextFieldControl style={searchStyle}>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>

        <XhSelectRoot
          value={status}
          collection={statuses}
          label="状态"
          placeholder="全部状态"
          onValueChange={details => setStatus(details.value)}
        />

        <XhSegmentedRoot
          value={range}
          collection={ranges}
          aria-label="时间粒度"
          onValueChange={details => setRange(details.value)}
        />

        <XhSeparator orientation="vertical" style={dividerStyle} />

        {/* 触发器本身就是那颗按钮：提示只补一句说明，不另起一个控件 */}
        <XhTooltipRoot>
          <XhTooltipTrigger onClick={resetFilters}>清空条件</XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>
              关键词、状态、粒度、排序链与勾选一起清空
              <XhTooltipArrow />
            </XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>
      </div>

      <XhTableRoot
        sort={sort}
        selection={selection}
        columns={columns}
        rows={rows}
        loading={loading}
        selectionMode="multiple"
        onSortChange={details => setSort(details.value)}
        onSelectionChange={details => setSelection(details.value)}
      >
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader value="select">
              <XhTableSelectAllTrigger />
            </XhTableColumnHeader>
            <XhTableColumnHeader value="no">
              <XhTableSortTrigger>单号</XhTableSortTrigger>
            </XhTableColumnHeader>
            <XhTableColumnHeader value="customer">客户</XhTableColumnHeader>
            <XhTableColumnHeader value="amount">
              <XhTableSortTrigger>金额</XhTableSortTrigger>
            </XhTableColumnHeader>
            <XhTableColumnHeader value="status">状态</XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>

        <XhTableBody>
          {paged.map(order => (
            <XhTableRow key={order.id} value={order.id}>
              <XhTableCell value="select">
                <XhTableRowSelectTrigger />
              </XhTableCell>
              <XhTableCell value="no">{order.no}</XhTableCell>
              <XhTableCell value="customer">{order.customer}</XhTableCell>
              <XhTableCell value="amount">{order.amount.toLocaleString("zh-CN")}</XhTableCell>
              <XhTableCell value="status">
                {/* 状态列是一枚标签：语气跟着状态走，颜色不在这里手写 */}
                <XhTagRoot tone={statusMeta[order.status].tone} size="sm">
                  <XhTagLabel>{statusMeta[order.status].label}</XhTagLabel>
                </XhTagRoot>
              </XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>

        <XhTableLoading>
          <span style={loadingStyle}>
            <XhSpinner size="sm" />
            正在取数…
          </span>
        </XhTableLoading>

        {/* 空态槽里放的就是空态组件，表格不必自己再造一套 */}
        <XhTableEmpty>
          <XhEmptyStateRoot>
            <XhEmptyStateTitle>这一组条件下没有订单</XhEmptyStateTitle>
            <XhEmptyStateDescription>放宽时间粒度，或者清空条件重来。</XhEmptyStateDescription>
          </XhEmptyStateRoot>
        </XhTableEmpty>
      </XhTableRoot>

      <XhPaginationRoot
        page={page}
        style={pagerStyle}
        count={filtered.length}
        pageSize={pageSize}
        onPageChange={details => setPage(details.page)}
      >
        {({ pages }) => (
          <>
            <XhPaginationSummary />
            <XhPaginationPrevTrigger />
            {pages.map((item, index) => (
              <Fragment key={\`\${item}-\${index}\`}>
                {item === "ellipsis"
                  ? <XhPaginationEllipsisTrigger>…</XhPaginationEllipsisTrigger>
                  : <XhPaginationItem value={item}>{item}</XhPaginationItem>}
              </Fragment>
            ))}
            <XhPaginationNextTrigger />
          </>
        )}
      </XhPaginationRoot>
    </div>
  );
}
`;export{e as default};
