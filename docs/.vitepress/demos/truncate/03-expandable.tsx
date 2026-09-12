// 点击展开 | expandable 让整块文字变成一颗按钮，Enter / Space 也按得动
import type { ReactNode } from "react";
import { XhTruncate } from "@xihan-ui/react";
import { useState } from "react";

const text
  = "这次更新把导出改成了后台任务：点导出后先落一条记录，处理完再推通知，"
    + "中途关掉页面也不影响；文件保留 7 天，过期由清理任务回收。";

export default function Demo(): ReactNode {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%", maxInlineSize: "420px" }}>
      {/* 写了 open 就是受控：状态在外面，组件只发意图 */}
      <XhTruncate
        open={expanded}
        onOpenChange={details => setExpanded(details.open)}
        lines={2}
        expandable
      >
        {text}
      </XhTruncate>

      <button type="button" style={{ justifySelf: "start" }} onClick={() => setExpanded(!expanded)}>
        {expanded ? "收回去" : "在外面展开"}
      </button>
    </div>
  );
}
