// 滚动加载 | 列表滚到底派发 load-more，宿主取下一页接到 collection 末尾
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";
import { useState } from "react";

interface Ticket {
  value: string;
  label: string;
}

const PAGE_SIZE = 20;
const TOTAL = 80;

function makePage(from: number): Ticket[] {
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    value: `no-${from + i + 1}`,
    label: `第 ${from + i + 1} 号工单`,
  }));
}

export default function Demo(): ReactNode {
  const [tickets, setTickets] = useState<Ticket[]>(() => makePage(0));
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  // 在途时不会再派发；取完了就不再取
  function loadMore(): void {
    if (tickets.length >= TOTAL)
      return;
    setLoading(true);
    window.setTimeout(() => {
      setTickets(prev => [...prev, ...makePage(prev.length)]);
      setLoading(false);
    }, 500);
  }

  return (
    <>
      <XhSelectRoot
        collection={tickets}
        value={picked}
        loading={loading}
        onValueChange={details => setPicked(details.value)}
        onLoadMore={loadMore}
        label="工单"
        placeholder="请选择"
      />
      <p data-demo-output>{`已加载 ${tickets.length} / ${TOTAL} 条`}</p>
    </>
  );
}
