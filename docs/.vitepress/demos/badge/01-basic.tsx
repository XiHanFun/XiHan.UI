// 计数角标 | 被标记的东西写进默认插槽，角标自己贴到它的角上；计数、上限截断与 0 值收起都归角标算
import type { ReactNode } from "react";
import { XhBadge, XhButton } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [count, setCount] = useState(5);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <XhBadge count={count} tone="danger" label={`${count} 条未读`}>
        <XhButton variant="outline">收件箱</XhButton>
      </XhBadge>

      <XhBadge count={128} max={99} tone="danger" label="128 条未读">
        <XhButton variant="outline">通知</XhButton>
      </XhBadge>

      {/* 计数为 0 时整枚收起，宿主不必自己判 */}
      <XhBadge count={0} tone="danger">
        <XhButton variant="outline">已读完</XhButton>
      </XhBadge>

      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton size="sm" onClick={() => setCount(c => c + 1)}>+1</XhButton>
        <XhButton size="sm" onClick={() => setCount(c => Math.max(0, c - 1))}>-1</XhButton>
      </div>
    </div>
  );
}
