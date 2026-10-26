// props 写法 | 不写结构时按标准结构铺：标题与触发器文字两项，正文另给；页脚的取消与确定照铺，点确定记一次「应用」
import type { ReactNode } from "react";
import { XhDrawerRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [applied, setApplied] = useState(0);

  return (
    <>
      <XhDrawerRoot
        trigger="筛选"
        title="筛选条件"
        body={<p>只看最近 30 天、状态为进行中的订单。</p>}
        confirmText="应用"
        onConfirm={() => setApplied(count => count + 1)}
      />
      <span data-demo-output>{`已应用 ${applied} 次`}</span>
    </>
  );
}
