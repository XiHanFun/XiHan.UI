// 远程模式 | 开 remote 后表格只铺服务端交来的这一页：排序钮、筛选菜单与分页照常可点，只改写状态、发事件，取数归宿主；分页按 recordCount 算页数，取数在途时表体照留、根上报 aria-busy
import type { TableColumnDef, TableFilterValue, TableSortDescriptor } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhTableRoot } from "@xihan-ui/react";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  customer: string;
  status: string;
  amount: number;
}

const statuses = ["待付款", "已发货", "已完成"];
const PAGE_SIZE = 8;

// 模拟服务端：整份数据只在这里，按排序、筛选与页码切好一页再交出去
const orders: Order[] = Array.from({ length: 57 }, (_, i) => ({
  id: `o${i + 1}`,
  customer: `客户 ${String(i + 1).padStart(2, "0")}`,
  status: statuses[i % statuses.length]!,
  amount: ((i * 37) % 900) + 100,
}));

interface Query {
  page: number;
  sort: TableSortDescriptor[];
  filterValue: TableFilterValue;
}

function fetchOrders({ page, sort, filterValue }: Query): Promise<{ rows: Order[]; total: number }> {
  const picked = filterValue.status ?? [];
  const hit = orders.filter(order => picked.length === 0 || picked.includes(order.status));
  const [by] = sort;
  if (by) {
    const sign = by.direction === "asc" ? 1 : -1;
    hit.sort((a, b) => sign * (by.id === "amount" ? a.amount - b.amount : a.customer.localeCompare(b.customer)));
  }
  const rows = hit.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return new Promise(resolve => setTimeout(resolve, 400, { rows, total: hit.length }));
}

const columns: TableColumnDef<Order>[] = [
  { id: "customer", label: "客户", sortable: true },
  { id: "status", label: "状态", filterOptions: statuses.map(value => ({ value })) },
  { id: "amount", label: "金额", sortable: true, align: "end", format: value => `¥ ${value}` },
];

export default function Demo(): ReactNode {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<TableSortDescriptor[]>([]);
  const [filterValue, setFilterValue] = useState<TableFilterValue>({});
  const [rows, setRows] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 筛选一变表格自己回到第 1 页：两处改动同一拍落下，这里只取一次数；晚到的旧请求不覆盖新结果
  useEffect(() => {
    let alive = true;
    setLoading(true);
    void fetchOrders({ page, sort, filterValue }).then((result) => {
      if (!alive)
        return;
      setRows(result.rows);
      setTotal(result.total);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [page, sort, filterValue]);

  return (
    <div style={{ width: "100%", maxWidth: "640px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        columns={columns}
        data={rows}
        recordCount={total}
        pageSize={PAGE_SIZE}
        loading={loading}
        remote
        pagination
        page={page}
        onPageChange={({ value }) => setPage(value)}
        sort={sort}
        onSortChange={({ value }) => setSort(value)}
        filterValue={filterValue}
        onFilterValueChange={({ value }) => setFilterValue(value)}
        aria-label="订单"
      />
      <span data-demo-output>{`第 ${page} 页 · 共 ${total} 条${loading ? " · 取数中" : ""}`}</span>
    </div>
  );
}
