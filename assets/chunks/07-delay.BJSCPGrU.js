const n=`// 延迟露面 | delay 让转圈挂载后等一段时间才出现：快请求在这之前就回来，转圈从头到尾不露面，不会闪一下
import type { ReactNode } from "react";
import { XhButton, XhSpinner, XhSpinnerLabel } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // 模拟一次耗时不同的请求：转圈只在请求在途时挂着
  function query(ms: number): void {
    setLoading(true);
    setResult("");
    window.setTimeout(() => {
      setLoading(false);
      setResult(\`用时 \${ms} ms，查询完成\`);
    }, ms);
  }

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <XhButton variant="outline" disabled={loading} onClick={() => query(200)}>快请求（200 ms）</XhButton>
        <XhButton variant="outline" disabled={loading} onClick={() => query(1500)}>慢请求（1.5 s）</XhButton>
      </div>
      {loading
        ? (
            <XhSpinner delay={400} label="正在查询">
              <XhSpinnerLabel />
            </XhSpinner>
          )
        : <span>{result}</span>}
    </div>
  );
}
`;export{n as default};
