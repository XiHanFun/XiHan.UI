// 播报方式 | 缺省 polite 让 root 成为活区，筛完就地播报；off 让它只是个普通容器
import type { ReactNode } from "react";
import {
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [keyword, setKeyword] = useState("曦寒");
  const [hits, setHits] = useState<string[]>([]);

  function search(): void {
    // 演示用：偶数长度的关键词当作有结果
    setHits(keyword.length % 2 === 0 ? ["一条命中的记录"] : []);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
          type="search"
          aria-label="关键词"
        />
        <button type="button" onClick={search}>搜索</button>
      </div>

      {/* 结果换成空的那一刻，读屏会在不打断当前朗读的前提下把标题念出来 */}
      {hits.length
        ? <p style={{ margin: 0 }}>{hits[0]}</p>
        : (
            <XhEmptyStateRoot live="polite">
              <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
              <XhEmptyStateTitle>{`没有匹配「${keyword}」的结果`}</XhEmptyStateTitle>
              <XhEmptyStateDescription>换个词，或者去掉几个筛选条件。</XhEmptyStateDescription>
            </XhEmptyStateRoot>
          )}
    </div>
  );
}
