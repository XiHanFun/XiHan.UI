const e=`// 局部范围 | 仅在指定区域内响应
import type { ReactNode } from "react";
import { XhHotkeys } from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [count, setCount] = useState(0);
  const scope = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scope}
      tabIndex={0}
      style={{ padding: "12px 16px", borderRadius: "var(--xh-shape-control)", background: "var(--xh-bg-subtle)" }}
    >
      {\`聚焦后按 Mod + Enter · \${count ? \`已触发 \${count} 次\` : "等待输入"}\`}
      <XhHotkeys keys={["Mod", "Enter"]} target={() => scope.current} onHotKey={() => setCount(value => value + 1)} />
    </div>
  );
}
`;export{e as default};
