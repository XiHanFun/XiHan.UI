// 监听吸附状态 | affix-change 报吸住与松开；默认插槽也把 affixed 透出来
import type { ReactNode } from "react";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [affixed, setAffixed] = useState(false);

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <div
        ref={setScrollEl}
        style={{
          blockSize: "220px",
          overflow: "auto",
          padding: "12px",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        <p style={{ blockSize: "120px" }}>往下滚，下面的状态会跟着变。</p>

        <XhAffixRoot
          target={scrollEl}
          onAffixChange={details => setAffixed(details.affixed)}
        >
          {({ affixed: pinned }) => (
            <XhAffixContent
              style={{ padding: "8px 12px", borderRadius: "6px", background: "var(--xh-bg-subtle)" }}
            >
              {pinned ? "已钉住" : "在常规流里"}
            </XhAffixContent>
          )}
        </XhAffixRoot>

        <p style={{ blockSize: "600px" }}>后面还有很长的内容。</p>
      </div>

      <span>
        affix-change 最近一次报的是：
        {affixed ? "吸住" : "松开"}
      </span>
    </div>
  );
}
