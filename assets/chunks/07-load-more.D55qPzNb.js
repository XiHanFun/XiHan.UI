var e=`// 加载更多 | 列表末尾放一个按钮追加下一批：取数时按钮转圈、不能重复点，取完了换成提示
import type { ReactNode } from "react";
import { LoaderIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhIcon,
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/react";
import { useState } from "react";

// 模拟分批取数：每次 4 条，共 11 条
const TOTAL = 11;
const BATCH = 4;
interface Row {
  id: number;
  name: string;
  desc: string;
}
function rowsFrom(from: number): Row[] {
  return Array.from({ length: Math.min(BATCH, TOTAL - from) }, (_, i) => ({
    id: from + i,
    name: \`通知 \${from + i + 1}\`,
    desc: \`系统消息 · \${from + i + 1} 小时前\`,
  }));
}
function fetchBatch(from: number): Promise<Row[]> {
  return new Promise(resolve => setTimeout(resolve, 800, rowsFrom(from)));
}

export default function Demo(): ReactNode {
  // 第一批随页面一起到
  const [rows, setRows] = useState<Row[]>(() => rowsFrom(0));
  const [loading, setLoading] = useState(false);
  const done = rows.length >= TOTAL;

  async function loadMore(from: number): Promise<void> {
    setLoading(true);
    const next = await fetchBatch(from);
    setRows(prev => [...prev, ...next]);
    setLoading(false);
  }

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "center", maxInlineSize: "360px" }}>
      <XhListRoot split style={{ inlineSize: "100%" }}>
        {rows.map(row => (
          <XhListItem key={row.id}>
            <XhListItemContent>
              <XhListItemTitle>{row.name}</XhListItemTitle>
              <XhListItemDescription>{row.desc}</XhListItemDescription>
            </XhListItemContent>
          </XhListItem>
        ))}
      </XhListRoot>
      <XhButton variant="subtle" loading={loading} disabled={done} onClick={() => loadMore(rows.length)}>
        <XhButtonIndicator><XhIcon icon={LoaderIcon} /></XhButtonIndicator>
        <XhButtonLabel>{done ? "没有更多了" : "加载更多"}</XhButtonLabel>
      </XhButton>
    </div>
  );
}
`;export{e as default};