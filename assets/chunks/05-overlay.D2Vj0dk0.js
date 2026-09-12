const n=`// 盖住等待中的内容 | 转圈浮在内容上方，容器同时报 aria-busy，看得见的与念得出的是同一件事
import type { CSSProperties, ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";
import { useState } from "react";

// 遮罩铺满被等待的那块内容，底色兑透明，下面的内容还看得见轮廓
const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  borderRadius: "8px",
  background: "color-mix(in oklab, var(--xh-bg-surface) 72%, transparent)",
};

export default function Demo(): ReactNode {
  const [busy, setBusy] = useState(true);

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <button type="button" onClick={() => setBusy(!busy)}>
        {busy ? "数据回来了" : "重新加载"}
      </button>

      {/* 内容留在原位，转圈叠在上面，加载前后布局不跳 */}
      <div
        aria-busy={busy}
        style={{
          position: "relative",
          inlineSize: "260px",
          padding: "16px",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: 0 }}>本季新增客户 128 家，环比增长 12%。</p>
        {busy && (
          <div style={overlayStyle}>
            <XhSpinner label="正在刷新报表" />
          </div>
        )}
      </div>
    </div>
  );
}
`;export{n as default};
