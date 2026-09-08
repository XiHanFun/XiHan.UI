// 滚动加载 | 浮层的滚动容器就是 content：滚动事件直接落在它身上，滚到底就把下一页并进选项
import type { ReactNode, UIEvent } from "react";
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

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
  const busy = useRef(false);

  // 距底不足 8px 视为触底，取下一页
  function onScroll(event: UIEvent<HTMLDivElement>): void {
    const el = event.currentTarget;
    if (busy.current || tickets.length >= TOTAL)
      return;
    if (el.scrollTop + el.clientHeight < el.scrollHeight - 8)
      return;
    busy.current = true;
    setLoading(true);
    window.setTimeout(() => {
      setTickets(prev => [...prev, ...makePage(prev.length)]);
      setLoading(false);
      busy.current = false;
    }, 500);
  }

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        placeholder="请选择"
      >
        <XhSelectLabel>工单</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent onScroll={onScroll}>
            <XhSelectList>
              {tickets.map(t => (
                <XhSelectItem key={t.value} value={t.value}>
                  <XhSelectItemText>{t.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
              {loading
                ? (
                    <XhSelectItem value="loading" disabled>
                      <XhSelectItemText>加载中…</XhSelectItemText>
                    </XhSelectItem>
                  )
                : null}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      <p>{`已加载 ${tickets.length} / ${TOTAL} 条`}</p>
    </>
  );
}
